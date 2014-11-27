define(
    [
        'app',
        'jade!../templates/EditProfileTemplate',
        'backbone',
        'backbone_validation'//,
        //'facebook'
    ],
    function (App, EditProfileTemplate, Backbone) {
        // Security concern with this page, is that it would be very easy for a 3rd party individual with access
        // to the users page. (eg someone in the same room)
        // To change the email, and password. And bar the user from their account
        // they would be unable to recover the password, and would have to
        // contact customer support with legitimation for their name.
        // ------- Above only applies to non-facebook accounts -------
        // actual facebook accounts benefit from us letting the user change their
        // fake FB email to their real email.
        // we could even make a step in the signup process where the FB user will be prompted
        // to "confirm" their email.
        var EditProfileView = Backbone.Marionette.Layout.extend({
            template: function () {
                console.log('trying to render AddNewItemTemplate');
                var that = this;
                return _.template(EditProfileTemplate());
            },
            initialize: function (options) {
                this.options = options || {};
                this.Geocoder = new google.maps.Geocoder();
            },
            events: {
                "click #ps_close":"close",
                "click #saveChanges": "SaveChanges",
                "change #profileSettingsEmail": "editEmail",
                "enter #profileSettingsEmail": "editEmail",
                "change #cityList": "editCity",
                "enter #cityList": "editCity",
                "change #schoolList": "editUniversity",
                "enter #schoolList": "editUniversity"
            },
            editEmail:function(){
              // save the data via ajax
                var sendData = {};
                if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test($('#profileSettingsEmail').val())) {
                sendData.newValue = $('#profileSettingsEmail').val();
                sendData.newAttribute = "email"
                $.ajax({
                    type: 'POST',
                    url: '/editUserInfo',
                    //url: '/upload/:articleID',
                    data: JSON.stringify(sendData),
                    contentType: "application/json",
                    success: function (e) {
                        console.log(e);
                        alert("Email Updated");
                    },
                    error: function (e) {
                        console.log(e);
                    }
                })
                }else{
                    alert('enter valid email');
                }
              // user feedback that change has been made (alert temporary)
            },
            editCity:function(){
                // save the data via ajax
                var sendData ={};
                sendData.newValue = $('#cityList').val();
                sendData.newAttribute = "city"
                $.ajax({
                    type: 'POST',
                    url: '/editUserInfo',
                    //url: '/upload/:articleID',
                    data: JSON.stringify(sendData),
                    contentType: "application/json",
                    success: function (e) {
                        console.log(e);
                        alert("City Updated");
                    },
                    error: function (e) {
                        console.log(e);
                    }
                })
                // user feedback that change has been made (alert temporary)
            },
            editUniversity:function(){
                // save the data via ajax
                var sendData = {};
                sendData.newValue = $('#schoolList').val();
                sendData.newAttribute = "university"
                $.ajax({
                    type: 'POST',
                    url: '/editUserInfo',
                    //url: '/upload/:articleID',
                    data: JSON.stringify(sendData),
                    contentType: "application/json",
                    success: function (e) {
                        console.log(e);
                        alert("University Updated");
                    },
                    error: function (e) {
                        console.log(e);
                    }
                })
                // user feedback that change has been made (alert temporary)
            },
            onShow: function () {
                // ask server for userdata info to fill out fields.
                // fill out email
                // fill out citry
                // fill out university
                // fill out profile picture
                var cities = [
                    {name: 'Albertslund', id: '', nr: 1},
                    {name: 'Allerød', id: 'cph', nr: 2},
                    {name: 'Ballerup', id: 'ods', nr: 3},
                    {name: 'Bornholm', id: 'aah', nr: 4},
                    {name: 'Brøndby', id: 'aal', nr: 5},
                    {name: 'Dragør', id: '', nr: 6},
                    {name: 'Egedal', id: 'cph', nr: 7},
                    {name: 'Fredensborg', id: 'ods', nr: 8},
                    {name: 'Frederiksberg', id: 'aah', nr: 9},
                    {name: 'Frederikssund', id: 'aal', nr: 10},
                    {name: 'Furesø', id: '', nr: 11},
                    {name: 'Gentofte', id: 'cph', nr: 12},
                    {name: 'Gladsaxe', id: 'ods', nr: 13},
                    {name: 'Glostrup', id: 'aah', nr: 14},
                    {name: 'Gribskov', id: 'aal', nr: 15},
                    {name: 'Halsnæs', id: '', nr: 16},
                    {name: 'Helsingør', id: 'cph', nr: 17},
                    {name: 'Herlev', id: 'ods', nr: 18},
                    {name: 'Hillerød', id: 'aah', nr: 19},
                    {name: 'Hvidovre', id: 'aal', nr: 20},
                    {name: 'Høje-Taastrup', id: '', nr: 21},
                    {name: 'Hørsholm', id: 'cph', nr: 22},
                    {name: 'Ishøj', id: 'ods', nr: 23},
                    // missing 24
                    {name: 'Copenhagen', id: 'aal', nr: 25},
                    {name: 'Lyngby-Taarbæk', id: '', nr: 26},
                    {name: 'Rudersdal', id: 'cph', nr: 27},
                    {name: 'Rødovre', id: 'ods', nr: 28},
                    {name: 'Tårnby', id: 'aah', nr: 29},
                    {name: 'Vallensbæk', id: 'aal', nr: 30},
                    {name: 'Favrskov', id: '', nr: 31},
                    {name: 'Hedensted', id: 'cph', nr: 32},
                    {name: 'Herning', id: 'ods', nr: 33},
                    {name: 'Holstebro', id: 'aah', nr: 34},
                    {name: 'Horsens', id: 'aal', nr: 35},
                    {name: 'Ikast-Brande', id: '', nr: 36},
                    {name: 'Lemvig', id: 'cph', nr: 37},
                    {name: 'Norddjurs', id: 'ods', nr: 38},
                    {name: 'Odder', id: 'aah', nr: 39},
                    {name: 'Randers', id: 'aal', nr: 40},
                    {name: 'Ringkøbing-Skjern', id: '', nr: 41},
                    {name: 'Samsø', id: 'cph', nr: 42},
                    {name: 'Silkeborg', id: 'ods', nr: 43},
                    {name: 'Skanderborg', id: 'aah', nr: 44},
                    {name: 'Skive', id: 'aal', nr: 45},
                    {name: 'Struer', id: '', nr: 46},
                    {name: 'Syddjurs', id: 'cph', nr: 47},
                    {name: 'Viborg', id: 'ods', nr: 48},
                    {name: 'Aarhus', id: 'aah', nr: 49},
                    {name: 'Brønderslev', id: 'aal', nr: 50},
                    {name: 'Frederikshavn', id: '', nr: 51},
                    {name: 'Hjørring', id: 'cph', nr: 52},
                    {name: 'Jammerbugt', id: 'ods', nr: 53},
                    {name: 'Læsø', id: 'aah', nr: 54},
                    {name: 'Mariagerfjord', id: 'aal', nr: 55},
                    {name: 'Morsø', id: '', nr: 56},
                    {name: 'Rebild', id: 'cph', nr: 57},
                    {name: 'Thisted', id: 'ods', nr: 58},
                    {name: 'Vesthimmerland', id: 'aah', nr: 59},
                    {name: 'Aalborg', id: 'aal', nr: 60},
                    {name: 'Faxe', id: '', nr: 61},
                    {name: 'Greve', id: 'cph', nr: 62},
                    {name: 'Guldborgsund', id: 'ods', nr: 63},
                    {name: 'Holbæk', id: 'aah', nr: 64},
                    {name: 'Kalundborg', id: 'aal', nr: 65},
                    {name: 'Køge', id: '', nr: 66},
                    {name: 'lejre', id: 'cph', nr: 67},
                    {name: 'Lolland', id: 'ods', nr: 68},
                    {name: 'Næstved', id: 'aah', nr: 69},
                    {name: 'Odsherred', id: 'aal', nr: 70},
                    {name: 'Ringsted', id: '', nr: 71},
                    {name: 'Roskilde', id: 'cph', nr: 72},
                    {name: 'Slagelse', id: 'ods', nr: 73},
                    {name: 'Solrød', id: 'aah', nr: 74},
                    {name: 'Sorø', id: 'aal', nr: 75},
                    {name: 'Stevns', id: '', nr: 76},
                    {name: 'Vordingborg', id: 'cph', nr: 77},
                    {name: 'Assens', id: 'ods', nr: 78},
                    {name: 'Bilund', id: 'aah', nr: 79},
                    {name: 'Esbjerg', id: 'aal', nr: 80},
                    {name: 'Fanø', id: '', nr: 81},
                    {name: 'Fredericia', id: 'cph', nr: 82},
                    {name: 'Faaborg-Midtfyn', id: 'ods', nr: 83},
                    {name: 'Haderslev', id: 'aah', nr: 84},
                    {name: 'Kerteminde', id: 'aal', nr: 85},
                    {name: 'Kolding', id: '', nr:86},
                    {name: 'Langeland', id: 'cph', nr: 87},
                    {name: 'Middelfart', id: 'ods', nr: 88},
                    {name: 'Nordfyn', id: 'aah', nr: 89},
                    {name: 'Nyborg', id: 'aal', nr: 90},
                    {name: 'Odense', id: 'aal', nr: 91},
                    {name: 'Svendborg', id: '', nr: 92},
                    {name: 'Sønderborg', id: 'cph', nr: 93},
                    {name: 'Tønder', id: 'ods', nr: 94},
                    {name: 'Varde', id: 'aah', nr: 95},
                    {name: 'Vejen', id: 'aal', nr: 96},
                    {name: 'Vejle', id: '', nr:97},
                    {name: 'Ærø', id: 'cph', nr: 98},
                    {name: 'Aabenraa', id: 'ods', nr: 99}
                ];
                var schools = [
                    {name: 'Aarhus University'},
                    {name: 'Copenhagen Business School'},
                    {name: 'DTU - Denmarks Technical University'},
                    {name: 'IT University of Denmark'},
                    {name: 'Copenhagens University'},
                    {name: 'Roskilde University'},
                    {name: 'Syddansk University'},
                    {name: 'Aalborg University'},
                    {name: 'The Royal Danish Academy of Fine Arts'},
                    {name: 'The Designschool Kolding'},
                    {name: 'Architectschool Aarhus'},
                    {name: 'Profession-highschool Metropol, University College'},
                    {name: 'Profession-highschool UCC, University College'},
                    {name: 'Profession-highschool Sjælland, University College'},
                    {name: 'Profession-highschool Lillebælt, University College'},
                    {name: 'PH UC Syddanmark'},
                    {name: 'Profession-highschool VIA, University College'},
                    {name: 'Profession-highschool Nordjylland, University College'},
                    {name: 'KEA'},
                    {name: 'Erhvervsakademi Sjælland'},
                    {name: 'Erhvervsakademi Kolding'},
                    {name: 'Erhvervsakademi SydVest'},
                    {name: 'Erhvervsakademi MidtVest '},
                    {name: 'Erhvervsakademi Aarhus'},
                    {name: 'Erhvervsakademi Dania'},
                    {name: 'Bornholms Sundheds- og Sygeplejeskole'},
                    {name: 'Danmarks Medie- og Journalisthøjskole'},
                    {name: 'Den Frie Lærerskole'},
                    {name: 'Pharmakon'},
                    {name: 'Maskinmesterskolen København'},
                    {name: 'Svendborg International Maritime Academy, SIMAC'},
                    {name: 'Fredericia Maskinmesterskole'},
                    {name: 'Aarhus Maskinmesterskole'},
                    {name: 'MARTEC'}
                ];
                //We probably want to take this function out and put it in some sort of utils class
                function sortByProperty(array, property) {
                    return array.sort(sortByProp(property));
                    function sortByProp(property) {
                        var sortOrder = 1;
                        if (property[0] === "-") {
                            sortOrder = -1;
                            property = property.substr(1);
                        }
                        return function (a, b) {
                            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property] ? 1 : 0);
                            return result * sortOrder;
                        }
                    }
                }

                sortByProperty(cities, "name");
                sortByProperty(schools, "name");
                $('#cityList').append('<option value="notChosen" selected="selected" disabled="disabled" class="option-disabled">City</option>');
                for (var i = 0; i < cities.length; i++) {
                    $('#cityList').append('<option value="' + cities[i].name + '">' + cities[i].name + '</option>');
                }

                $('#schoolList').append('<option value="notChosen" selected="selected" disabled="disabled" class="option-disabled">School</option>');
                for (var i = 0; i < schools.length; i++) {
                    $('#schoolList').append('<option value="' + schools[i].name + '">' + schools[i].name + '</option>');
                }

                $.ajax({
                    url: '/isLoggedIn',
                    type: 'GET',
                    success: function (data) {
                        if(data.facebook != undefined)
                        var s =data.facebook.email;
                        console.log(s);
                        // fill out email
                        function imageExists(url) {
                            var img = new Image();
                            img.onload = function () { // Do something now you know the image exists.
                                $('#userImg').html("<img id='UserImgImg' src='https://s3-eu-west-1.amazonaws.com/checktomprofileimg/" + data.profilePicture + "?" + new Date().getTime() + " ' class='userPicture'/>");
                            };
                            img.onerror = function () {
                                console.log("profile didn't load properly, using placeholder");
                                $('#userImg').html("<img id='UserImgImg',src='https://s3-eu-west-1.amazonaws.com/checktomprofileimg/userplaceholder.jpg'>");
                            };
                            img.src = url;
                        }

                        imageExists("https://s3-eu-west-1.amazonaws.com/checktomprofileimg/" + data.profilePicture)
                        console.log(data);
                        $('#userName').html("<p>" + data.username + "</p>");
                        // fill out city
                        if(data.city!=""){
                            $('#cityList').val(data.city)
                        }
                        if(data.university!="")
                        {
                            $('#schoolList').val(data.university)
                        }
                        var re = new RegExp('@facebook.com');
                        if (data.email.match(re)) {

                        }else{
                            $('#profileSettingsEmail').val(data.email);
                        }

                    },
                    error: function (err) {
                        console.log(err);
                        window.location.replace("/#stream");
                    }
                });


                // Then send an updateUser request to the server

            },
            SaveChanges: function (e) {
                e.preventDefault();

                var formData = new FormData($('#ProfileForm')[0]);

                $.ajax({
                    url: '/updateUser',
                    type: 'POST',
                    contentType: 'application/json',
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    success: function (data) {
                        console.log(e);
                        $("#UserImgImg").attr("src", $("#UserImgImg").attr("src") + new Date());
                    },
                    error: function (data) {
                        console.log(data);
                        alert("Error uploading image"+data);
                    }
                })
            },
            validateAttri: function (obj) {
                if (typeof obj !== "undefined" && obj !== "" && obj !== null) {
                    return true;
                } else {
                    return false;
                }
            },
            sendForm: function (e) {
            }

        });

        return EditProfileView;
    });

