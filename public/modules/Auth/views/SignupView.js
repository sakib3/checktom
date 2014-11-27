define(
    [
        'app',
        'jade!../templates/SignupTemplate',
        'models/SignupModel',
        'backbone',
        'backbone_validation',
        'woomark'//,
        //'facebook'
    ],
    function (App, SignupTemplate, SignupModel, Backbone) {
        var SignupView = Backbone.Marionette.Layout.extend({
            requireLogin: true,
            model: new SignupModel(),
            template: function () {
                console.log('trying to render SignupTemplate');
                var that = this;
                return _.template(SignupTemplate());
            },
            initialize: function (options) {
                this.options = options || {};

            },
            events: {
                "submit #registerForm": "register",  // example {"submit #AnForm" : "postform"}
                "click #fbButton": "loginWithFb"
            },

            onShow: function () {
                $('#checkBoxIsStudent').on('toggle', function () {
                    $('#checkBoxIsNotStudent').checkbox('uncheck');
                    $('#signupTitleOrPosition').hide();
                    $('#schoolListWrapper').show();
                    $('#cityListWrapper').show();
                });
                $('#checkBoxIsNotStudent').on('toggle', function () {
                    $('#checkBoxIsStudent').checkbox('uncheck');
                    $('#schoolListWrapper').hide();
                    $('#signupTitleOrPosition').show();
                    $('#cityListWrapper').show();
                });
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

// commented because the checkboxes aren't visible.
//                $('#schoolListWrapper').hide();
//                $('#signupTitleOrPosition').hide();
//                $('#cityListWrapper').hide();
            },
            loginWithFb: function (e) {
                e.preventDefault();
                window.location.replace("/auth/facebook");
            },
            register: function (event) {
                event.preventDefault();
                var that=this;
                console.log("wat");
                // send ajax POST  /users from forms
                // {"email":"email@email.com",
                // "name":"patrick",
                //  "password":"123",
                //  "city":"roskilde",
                //  "university":"navnpåuni"}

                // validate that the fields are not empty and that the required fields are filled correctly (email proper format)
                //
                var createUser = new SignupModel();

                var user_details = {
                    email: $('input[id=signup-email]').val(),
                    name: $('input[id=signup-name]').val(),
                    password: $('input[id=signup-password]').val(),
                    city: $('#cityList').val(),
                    university: $('#schoolList').val()
                };

                console.log(user_details);
                if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/.test(user_details.email)) {
                    this.model = createUser;
                    this.model.save(user_details, {error: function (model, error) {
                        console.log(error.responseText);

                    },
                        success: function (model, response) {
                            console.log('User Signup Updated' + response.message);
                            if(that.options.RedirectedFromLink!='undefined' && that.options.RedirectedFromLink==true)
                            {
                                window.location.replace('/#article/'+that.options.RedirectItem);
                            }else{
                                window.location.replace("/#stream");
                            }                        }
                    });
                } else {
                    alert('Email or Password cannot be empty');
                    return false;
                }


            }

        });

        return SignupView;
    });
