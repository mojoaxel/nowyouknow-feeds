module.exports = {
	reporter: 'json',
	noColors: false,
	noShowFeed: true,
	suppress: [
		{level: 'error', text: 'Undefined channel element: itunes:type'},
		{level: 'warning', type: 'UnknownNamespace' },
		{level: 'warning', type: 'SelfDoesntMatchLocation' }
	],
	plugins: []
};
