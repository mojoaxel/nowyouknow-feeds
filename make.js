const fs = require('fs');
const ora = require('ora');
const extend = require('extend');
const moment = require('moment');
const RSS = require('rss');
const promisify = require("promisify-node");
const remoteFileSize = async (url) => promisify(require('remote-file-size'))(url);

const package = require('./package.json');
const data = require('./nowyouknow.json');

async function generateFeed(name, format) {
	const filename = `${name}_${format}.xml`;
	let spinner = new ora(`creating feed ${filename}`).start();

	const settings = extend(data.feed, {
		feed_url: package.homepage + filename,
		site_url: data.page,
	});

	var feed = new RSS(settings);
	let index = 0;
	for (const item of data.items) {
		let url = data.cdn + item[format];
		spinner.text = `gettings filesize of ${url}`;
		let size = await remoteFileSize(url);

		let episode = {
			title: item.title,
			description: `${item.title} (${format.toUpperCase()})`,
			url: url,
			date: moment(data.feed.pubDate).seconds(index++), // any format that js Date can parse.
			enclosure: {
				url: url,
				size: size,
				type: `audio/${format}`
			},
			custom_elements: []
		};

		//TODO "itunes:duration": 00:21:25

		if (item.speaker) {
			episode.custom_elements.push({
				"itunes:author": item.speaker
			})
		};

		if (item.chapters) {
			let chapters = [{
				"_attr": {
					"xmlns:psc": "http://podlove.org/simple-chapters",
					"version": "1.2"
				}
			}];
			for (const chapter of item.chapters) {
				let chapterObj = {
					"psc:chapter": {
						"_attr": {
							"start": chapter.start,
							"title": chapter.title
						}
					}
				};
				if (chapter.href) {
					chapterObj['psc:chapter']['_attr'].href = chapter.href
				}
				chapters.push(chapterObj);
			}
			episode.custom_elements.push({ "psc:chapters": chapters });
		};

		feed.item(episode);
	};
	spinner.text = `saving xml to file ${filename}`;

	var xml = feed.xml({indent: true});
	fs.writeFile(filename, xml, (err) => {
		if (err) {
			spinner.fail(`faild to create feed file ${filename}`);
			throw err;
		}
		spinner.succeed(`created feed file ${filename}`);
	});
}

async function genAllFeeds(name) {
	await generateFeed(name, "mp3");
	await generateFeed(name, "ogg");
}

genAllFeeds("all");
