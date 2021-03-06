"use strict";

const {
	extractLinkTags,
	removeEnclosingBrackets,
	removeSetters,
	extractLink,
	nonEmptyLinks,
	uniques,
	internalLinks,
} = require("./link-parser");
const uniq = require('lodash.uniq');

const extractGoToLinkTags = (text) =>
	text.match(
		/<goto[^>]+(\[\[.*?\]\])"\/>|<goto[^>]+(\[\[.*?\]\])">.*?<\/goto>|/g
	);

const extractActOrBtnLinkTags = (text) =>
	text.match(/<act.*?>(\[\[.*?\]\])<\/act>|<btn.*?>(\[\[.*?\]\])<\/btn>/g);

const getResults = (links, internalOnly) => {
	let result = links
		? extractLinkTags(links.join())
				.map(removeEnclosingBrackets)
				.map(removeSetters)
				.map(extractLink)
				.filter(nonEmptyLinks)
				.filter(uniques)
		: [];

	if (internalOnly) {
		result = result.filter(internalLinks);
	}
	return result;
};

module.exports = (text, internalOnly) => {
	const gotoLinks = getResults(extractGoToLinkTags(text), internalOnly);
	const actOrBtnLinks = getResults(extractActOrBtnLinkTags(text), internalOnly);

	return {
		goto: uniq(gotoLinks),
		actOrBtn: uniq(actOrBtnLinks),
	};
};
