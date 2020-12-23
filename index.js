const fs = require('fs');
const slugify = require('slugify');
const rm = require('rimraf');
const TurndownService = require('turndown');
const posts = require('./data.json')[2].data;
const REAMDE = fs.createWriteStream('./README.md');

const turndownService = new TurndownService();
const formatDate = date => {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

rm('posts', e => {
    fs.mkdirSync('posts');
    REAMDE.write(`# Yeastbound and Down Archives\n\n`);
    posts.filter(p => p.post_type === 'post' && p.post_status === 'publish').forEach(post => {
        const date = formatDate(post.post_date);
        const cleanedUp = post.post_content.replace(/\r\n/g, '\n').replace(/\n\n/g, '</p><p>').replace(/\n/g, '<p>');
        const content = turndownService.turndown(`<h1>${post.post_title}</h1>\n${cleanedUp}`);
        const filePath = `./posts/${slugify([date, post.post_title].join(' '))}.md`;
        fs.writeFileSync(filePath, content);
        REAMDE.write(`* [${post.post_title}](${filePath})\n`);
    });

    REAMDE.close();
});
const files = fs.readdirSync('posts');


files.reduce((str, file) => str += `* []()`)




