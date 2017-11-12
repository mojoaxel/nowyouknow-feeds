const fs = require('fs');
const ora = require('ora');
const extend = require('extend');
const RSS = require('rss');

const package = require('./package.json');
const data = require('./nowyouknow.json');

function generateFeed(name, format) {
	const filename = `${name}_${format}.xml`;
	let spinner = new ora(`creating feed ${filename}`).start();

	const settings = extend(data.feed, {
		feed_url: package.homepage + filename,
		site_url: data.page,
	});

	var feed = new RSS(settings);
	for (const item of data.items) {
		var url =  data.cdn + item[format];
		feed.item({
			title:  item.title,
			description: `${item.title} (${format.toUpperCase()})`,
			url: url,
			date: data.feed.pubDate, // any format that js Date can parse.
			enclosure: {url: url, type: `audio/${format}`},
			custom_elements: []
		});
	}

	var xml = feed.xml({indent: true});
	fs.writeFile(filename, xml, (err) => {
		if (err) {
			spinner.fail(`faild to create feed file ${filename}`);
			throw err;
		}
		spinner.succeed(`created feed file ${filename}`);
	});
}

generateFeed("all", "mp3");
