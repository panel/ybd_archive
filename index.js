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

rm("posts", (e) => {
  const byCategory = {};
  fs.mkdirSync("posts");
  fs.mkdirSync("posts/recipes");
  fs.mkdirSync("posts/reviews");
  fs.mkdirSync("posts/other");
  posts.filter((p) => p.post_type === "post" && p.post_status === "publish")
    .forEach((post) => {
      const date = formatDate(post.post_date);
      const cleanedUp = post.post_content.replace(/\r\n/g, "\n").replace(
        /\n\n/g,
        "</p><p>",
      ).replace(/\n/g, "<p>").replace(/\[caption .*(<.*\/>).*caption\]/g, "$1");
      const content = turndownService.turndown(
        `<h1>${post.post_title}</h1>\n${cleanedUp}`,
      );
      const category = categorize(post.post_title);
      const filePath = `./posts/${category.toLowerCase()}/${
        slugify([date, post.post_title].join(" ")).replace(/:/g, "")
      }.md`;
      fs.writeFileSync(filePath, content);
      if (!byCategory[category]) byCategory[category] = [];
      byCategory[category].push([post.post_title, filePath]);
    });

  const readme = Object.entries(byCategory).reverse().reduce(
    (page, [category, posts]) =>
      page.concat([
        `## ${category}`,
        ...posts.map((p) => `* [${p[0]}](${p[1]})`),
      ]),
    [],
  ).join("\n");
  fs.writeFileSync("./README.md", readme);
  fs.copyFileSync("./README.md", "./index.md");
});
const files = fs.readdirSync("posts");
