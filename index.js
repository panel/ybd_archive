const fs = require("fs");
const slugify = require("slugify");
const rm = require("rimraf");
const TurndownService = require("turndown");
const posts = require("./data.json")[2].data;
const turndownService = new TurndownService();

const formatDate = (date) => {
  let d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) {
    month = "0" + month;
  }
  if (day.length < 2) {
    day = "0" + day;
  }

  return [year, month, day].join("-");
};

const categorize = (title) => {
  return (/recipe/i.test(title))
    ? "Recipes"
    : (/review/i.test(title))
    ? "Reviews"
    : "Other";
};

const makePage = (byCategory, category) =>
  byCategory[category].sort().reduce((
    lines,
    line,
  ) => lines.concat([`* [${line[0]}](${line[1]})`]), [`---
layout: page
title: ${category}
---`]).join("\n");

rm("_posts", (e) => {
  const byCategory = {};
  fs.mkdirSync("_posts");
  fs.mkdirSync("_posts/recipes");
  fs.mkdirSync("_posts/reviews");
  fs.mkdirSync("_posts/other");
  posts.filter((p) => p.post_type === "post" && p.post_status === "publish")
    .forEach((post) => {
      const category = categorize(post.post_title);
      const date = formatDate(post.post_date);
      const postFile = slugify([date, post.post_title].join(" ")).replace(/:/g, "");
      const cleanedUp = post.post_content.replace(/\r\n/g, "\n").replace(
        /\n\n/g,
        "</p><p>",
      ).replace(/\n/g, "<p>").replace(/\[caption .*(<.*\/>).*caption\]/g, "$1");
      const content = `---
layout: post
title: "${post.post_title}"
category: ${category}
---

` + turndownService.turndown(
        `<h1>${post.post_title}</h1>\n${cleanedUp}`,
      );
      fs.writeFileSync(`_posts/${category.toLowerCase()}/${postFile}.md`, content);
      if (!byCategory[category]) byCategory[category] = [];
      byCategory[category].push([post.post_title, [category.toLowerCase(), ...date.split('-'), post.post_title.replace(/:/g, '').replace(/\s/g, '-')].join('/') + '.html']);
    });

  const readme = Object.entries(byCategory).reverse().reduce(
    (page, [category, posts]) =>
      page.concat([
        `\n## ${category}\n`,
        ...posts.map((p) => `* [${p[0]}](${p[1]})`),
      ]),
    [],
  ).join("\n");
  fs.writeFileSync("./README.md", readme);

  const recipes = makePage(byCategory, "Recipes");
  const reviews = makePage(byCategory, "Reviews");

  fs.writeFileSync("./recipes.markdown", recipes);
  fs.writeFileSync("./reviews.markdown", reviews);
});
// const files = fs.readdirSync("_posts");
