var ArticleControll = require('../controllers/articleController');

module.exports = function (app, passport) {
    app.post('/searchQuery',ArticleControll.SearchArticles);

    app.post('/createArticle',ArticleControll.CreateArticle);

    app.post('/updateArticle',ArticleControll.updateClickCounter);
    app.post('/oldNotification',ArticleControll.oldNotification);
    app.post('/findChatParticipantByAricleID',ArticleControll.findChatParticipantByAricleID);

    app.post('/findSpecificArticle',ArticleControll.FindItemByArtID);
    app.get('/findAllArticlesByArtId',ArticleControll.FindItemsByArtId);

    app.post('/UpdateSpecificAttribute',ArticleControll.EditSingleAttri);
    app.post('/UpdateSpecificAttributeImage',ArticleControll.EditImageForArticle);
    app.post('/UpdateSpecificAttributeHashtags',ArticleControll.EditHashtagsForArticle);

    app.post('/readNotification',ArticleControll.readNotification);

}