define(
    [
        'jade!../templates/EditUserTemplate',
        'models/PostUsersModel',
        'backbone',
        'backbone_validation'//,
        //'facebook'
    ],
    function (EditUserTemplate, PostUsersModel, Backbone) {
        var EditUserView = Backbone.Marionette.Layout.extend({
            requireLogin: true,
            model: new PostUsersModel(),
            template: function() {
                console.log('trying to render editUserTemplate');
                var that = this;
                return _.template(EditUserTemplate());
            },
            initialize: function (options) {
                this.options = options || {}
            },
            onShow:function(){
                $.ajax({
                    url: "http://localhost:3000/getAllSignedUsers"
                }).then(function(data) {

                        $.each(data, function(index, element) {
                                console.log(element.email);
                            $('#EditUserRecord').append("<p>" + element.email + "</p><button class='EditButton' type='button' " +
                                "value="+element.email+"%s%"+element.created_at+"%s%"+element.number_of_friends+"%s%"+element.shared+">Edit</button><br>");
                        })
            })},
            events: {
                "click #CloseModule": "closeModule",
                "click #blurLayer": "closeModule",
                "click #EditEmail, #EditCreatedAt, #EditNrOfFriends, #EditSharedCompetitionCriteria":"UnlockSubmit",
                "click #SubmitEdit":"SendUpdateSignup",
                "click .EditButton":"EditPost"
                // example {"submit #AnForm" : "postform"}
            },
            UnlockSubmit:function(event){
                event.preventDefault();
                $('#SubmitEdit').attr("disabled", false);
            },
            SendUpdateSignup:function(event){
                event.preventDefault();
                var updateUser = new PostUsersModel();
                console.log('trying to send..');
                if($('input[id=EditSharedCompetitionCriteria]').val()=='true' ||$('input[id=EditSharedCompetitionCriteria]').val()=='false')
                {
                    console.log('sending..');
                    var user_details = {
                        email:$('input[id=EditEmail]').val(),
                        created_at:$('input[id=EditCreatedAt]').val(),
                        number_of_friends:$('input[id=EditNrOfFriends]').val(),
                        shared:$('input[id=EditSharedCompetitionCriteria]').val()
                    };
                    console.log(user_details);
                    this.model = updateUser;
                    this.model.save(user_details,{error: function (model, error) {
                            console.log(error.responseText);

                        },
                        success: function (model, response) {
                            console.log('Email Signup Updated'+ response.message)

                        }
                    });
                    this.close();
                }else
                {
                    alert('shared must be true or false');
                }

            },
            EditPost:function(event){
                var list = event.currentTarget.value.split("%s%");
                $('input[id=EditEmail]').val(list[0]),
                $('input[id=EditCreatedAt]').val(list[1]),
                $('input[id=EditNrOfFriends]').val(list[2]),
                $('input[id=EditSharedCompetitionCriteria]').val(list[3]),
                $('#EditUserForm').css("display", "block"),
                $('#EditUserList').css("display", "none")

            },
            closeModule:function(event){
                console.log('trying to close edit user');
                event.preventDefault();

                this.close();
            }


        });

        return EditUserView;
    });
