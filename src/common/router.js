/* The router managing the app's views. */

let Vue = require('vue');
const VueRouter = require('vue-router');
const LocaleView = require('../locale/view');
const ChatbotEditView = require('../chatbot-edit-view');
// const StoryListView = require('../story-list-view');
// const WelcomeView = require('../welcome');
const HomeView = require('../home');
const ChatbotsView = require('../chatbots');
const locale = require('../locale');
const { getStoryPlayHtml, getStoryProofingHtml, getStoryTestHtml } = require('./story-html');
const replaceUI = require('../ui/replace');
// const store = require('../data/store');

Vue.use(VueRouter);

let TwineRouter = new VueRouter();

TwineRouter.map({
	/*  We connect routes with no params directly to a component. */

	'/locale': {
		component: LocaleView
	},

	// '/welcome': {
	// 	component: WelcomeView
	// },

	'/home': {
		component: HomeView,
	},

	'/chatbots': {
		component: ChatbotsView,
	},

	/*
	For routes that take data objects, we create shim components which provide
	appropriate props to the components that do the actual work.
	*/

	// '/stories': {
	// 	component: {
	// 		template:
	// 			'<div><story-list ' +
	// 			':previously-editing="previouslyEditing"></story-list></div>',

	// 		components: {'story-list': StoryListView},

	// 		data() {
	// 			return {
	// 				previouslyEditing: this.$route.params
	// 					? this.$route.params.previouslyEditing
	// 					: ''
	// 			};
	// 		}
	// 	}
	// },

	'/chatbots/:id': {
		component: {
			template: '<div><story-edit :story-id="id"></story-edit></div>',

			components: {'story-edit': ChatbotEditView},

			data() {
				return {id: this.$route.params.id};
			}
		}
	},

	/*
	These routes require special handling, because we tear down our UI when
	they activate.
	*/

	'/chatbots/:id/play': {
		component: {
			ready() {
				getStoryPlayHtml(this.$store, this.$route.params.id)
					.then(replaceUI)
					.catch(e => {
						window.alert(
							locale.say(
								'An error occurred while publishing your chatbot. (%s)',
								e.message
							)
						);

						/* Force returning to the previous view. */

						throw e;
					});
			}
		}
	},

	'/chatbots/:id/proof': {
		component: {
			ready() {
				getStoryProofingHtml(this.$store, this.$route.params.id)
					.then(replaceUI)
					.catch(e => {
						window.alert(
							locale.say(
								'An error occurred while publishing your chatbot. (%s)',
								e.message
							)
						);

						/* Force returning to the previous view. */

						throw e;
					});
			}
		}
	},

	'/chatbots/:id/test': {
		component: {
			ready() {
				getStoryTestHtml(this.$store, this.$route.params.id)
					.then(replaceUI)
					.catch(e => {
						window.alert(
							locale.say(
								'An error occurred while publishing your chatbot. (%s)',
								e.message
							)
						);

						/* Force returning to the previous view. */

						throw e;
					});
			}
		}
	},

	'/chatbots/:storyId/test/:passageId': {
		component: {
			ready() {
				getStoryTestHtml(
					this.$store,
					this.$route.params.storyId,
					this.$route.params.passageId
				)
					.then(replaceUI)
					.catch(e => {
						window.alert(
							locale.say(
								'An error occurred while publishing your chatbot. (%s)',
								e.message
							)
						);

						/* Force returning to the previous view. */

						throw e;
					});
			}
		}
	}
});

/* By default, show the story list. */

TwineRouter.redirect({
	'*': '/home'
});

TwineRouter.beforeEach(transition => {
	/*
	If we are moving from an edit view to a list view, give the list view the
	story that we were previously editing, so that it can display a zooming
	transition back to the story.
	*/

	if (transition.from.path && transition.to.path === '/chatbots') {
		const editingId =
			transition.from.path.match('^/chatbots/([^\/]+)$');

		if (editingId) {
			transition.to.params.previouslyEditing = editingId[1];
		}
	}

	/*
	If the user has never used the app before, point them to the welcome view
	first. This has to come below any other logic, as calling transition.next()
	or redirect() will stop any other logic in the function.
	*/

	// const welcomeSeen = store.state.pref.welcomeSeen;

	// if (transition.to.path === '/welcome' || welcomeSeen) {
		transition.next();
	// }
	// else {
		// transition.redirect('/welcome');
	// }
});

module.exports = TwineRouter;
