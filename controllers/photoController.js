var path = require('path'),
    appDir = path.dirname(require.main.filename);
var formidable = require('formidable');
var fs = require('fs');
var im = require('imagemagick');
var AWS = require('aws-sdk');
var request = require('request');
AWS.config.loadFromPath('./config/aws.json');
var crypto = require('crypto');
var domain = require('domain'),
    d = domain.create();
//im.identify.path = "C:/Program Files/ImageMagick-6.8.9-Q16/identify";
//im.convert.path = "C:/Program Files/ImageMagick-6.8.9-Q16/convert";
// im.identify.path = "E:/ImageMagick-6.8.9-Q8/identify";
// im.convert.path = "E:/ImageMagick-6.8.9-Q8/convert";

// creating handles for our image buckets
var s3fullpics = new AWS.S3({params: {Bucket: 'checktomfullpics'}});
var s3thumbnails = new AWS.S3({params: {Bucket: 'checktomthumbnails'}});
var s3profileimg = new AWS.S3({params: {Bucket: 'checktomprofileimg'}});


function getExtension(filename) {
    return filename.split('.').pop();
}
//  article.jpg    +    https://img.com
exports.uploadFacebookImg = function (filename, imgLink, callback) {
    console.log("in uploadimg")
    console.log(imgLink);

    console.log("in request get")

    // Continue with your processing here.
    request.get({url: imgLink, encoding: 'binary'}, function (err, response, body) {
        fs.writeFile("./Uploads/test", body, 'binary', function (err) {
            if (err) {

                console.log(err);

            } else {
                console.log("The file was saved!");
                fs.readFile("./Uploads/test", function (err, data) {
                    if (err) {
                        console.log("error" + err);
                        unlink("./Uploads/test");
                        callback(false);
                    } else {
                        console.log("in readfile")
                        var keypath = './Uploads/' + filename;
                        im.resize({
                            srcData: data,
                            dstPath: keypath,
                            format: 'jpg',
                            width: 150,
                            height: 150
                        }, function (err, stdout, stderr) {
                            if (err) {
                                console.log("imagemagick error: " + err);
                                unlink("./Uploads/test");
                                // delete the files, if error happened. Or maybe try again before canceling.
                                // unlink(newPath);
                                // unlink(thumbs);
                                // try again, exit the function. (assuming return takes us out of the exported function)
                                callback(false);
                            } else {
                                /// write full file to temp
                                var imgData = null;
                                fs.readFile(keypath, function (err, data) {
                                    imgData = data;
                                    readCallback();
                                });
                                // callback needed otherwise unlinking the file wont work.
                                function readCallback() {
                                    s3profileimg.putObject({Key: filename, Body: imgData}, function (err, data) {
                                        if (err) {
                                            unlink(keypath);
                                            unlink("./Uploads/test");
                                            console.log("Error uploading data: ", err);
                                            callback(false);
                                        } else {
                                            unlink(keypath);
                                            unlink("./Uploads/test");
                                            console.log("Successfully uploaded fullpic to AWS");
                                            callback(true);
                                        }
                                    });
                                }

                            }
                            console.log('resized image to fit within 150x150px');

                        });
                    }

                });
            }
        });


    });
}

function checksum(str) {
    return crypto
        .createHash('md5')
        .update(str, 'utf8')
        .digest('base64');

}
exports.uploadNewArticleImg = function (ArticleId, files, res, callback) {//{request,ArticleId,callback){

    console.log()
    // false, didn't upload succesfully, or true, uploaded succesfully.
    var responseToClient = false;

    var i = 0;
    var tempLocation = './Uploads/';
    if (typeof files["image" + i] !== 'undefined' && typeof files["image" + i].name !== 'undefined' && files["image" + i].name !== null && files["image" + i].name !== '') {
        var UploadUrl = ArticleId + ".jpg";
        var img = files["image0"]
        fs.readFile(img.path, function (err, data) {
            if (err) {
                console.log("error" + err);
                throw new Error('imageError');
            } else {
                console.log('in the readfile');

                var imageName = img.name;
                console.log("imagename:" + imageName);
                var fileExtension = '' + getExtension(imageName);
                // checks picture formats
                if ((fileExtension == 'jpg') || (fileExtension == 'png') || (fileExtension == 'tiff') || (fileExtension == 'gif') || (fileExtension == 'bmp') || (fileExtension == 'jfif') || (fileExtension == 'svg') || (fileExtension == 'cgm')) {
                    console.log('file extensions supported');
                    /// If there's an error
                    if (!imageName) {
                        console.log("There was an error")
                        throw new Error('imageError');
                    } else {

                        // create the paths where we want our files to go on server.
                        // var keyName = ArtId + ".jpg"; UploadUrl


                        // if the image is bigger than 700 resize it down to 700.
                        im.identify(img.path, function (err, pictureInfo) {
                            if (err) {
                                console.log(err);
                                throw new Error('imageError');
                            }
                            console.log("picture uploaded width: " + pictureInfo.width);
                            if (pictureInfo.width > 700) {
                                im.resize({
                                    srcData: data,
                                    dstPath: tempLocation + "full" + UploadUrl,
                                    format: 'jpg',
                                    width: 700
                                }, function (err, stdout, stderr) {
                                    if (err) {
                                        console.log("imagemagick error: " + err);
                                        // delete the files, if error happened. Or maybe try again before canceling.
                                        // unlink(newPath);
                                        // unlink(thumbs);
                                        // try again, exit the function. (assuming return takes us out of the exported function)
                                        throw new Error('imageError');
                                    } else {
                                        /// write full file to temp
                                        var imgData = null;
                                        fs.readFile(tempLocation + "full" + UploadUrl, function (err, data) {
                                            if (err) {
                                                throw new Error('imageError');
                                            } else {
                                                imgData = data;
                                                readCallback();
                                            }
                                        });
                                        // callback needed otherwise unlinking the file wont work.
                                        function readCallback() {
                                            s3fullpics.putObject({Key: UploadUrl, Body: imgData}, function (err, data) {
                                                if (err) {
                                                    unlink(tempLocation + "full" + UploadUrl);
                                                    throw new Error('imageError');
                                                    console.log("Error uploading data: ", err);
                                                } else {
                                                    unlink(tempLocation + "full" + UploadUrl);
                                                    console.log("Successfully uploaded fullpic to AWS");
                                                }
                                            });
                                        }

                                    }
                                    console.log('resized image to fit within 700px');

                                });
                            } else {
                                console.log('image within 700px width, no resize needed');
                                s3fullpics.putObject({Key: UploadUrl, Body: data}, function (err, data) {
                                    if (err) {
                                        console.log("Error uploading data: ", err);
                                        throw new Error('imageError');
                                    } else {
                                        console.log("Successfully uploaded fullpic to AWS");
                                    }
                                });
                            }
                            // write a resized file to thumbs folder
                            im.resize({
                                srcData: data,
                                dstPath: tempLocation + "thumb" + UploadUrl,
                                width: 230,
                                format: 'jpg'
                            }, function (err, stdout, stderr) {
                                if (err) {
                                    console.log("imagemagick error: " + err);
                                    // delete the files, if error happened. Or maybe try again before canceling.

                                    // try again, exit the function. (assuming return takes us out of the exported function)
                                    throw new Error('imageError');

                                } else {


                                    console.log('resized image to fit within 230px');
                                    var imgData = null;
                                    fs.readFile(tempLocation + "thumb" + UploadUrl, function (err, data) {
                                        if (err) {
                                            throw new Error('imageError');
                                        } else {
                                            imgData = data;
                                            readCallback();
                                        }
                                    });

                                    function readCallback() {
                                        s3thumbnails.putObject({Key: UploadUrl, Body: imgData}, function (err, data) {
                                            if (err) {
                                                unlink(tempLocation + "thumb" + UploadUrl);
                                                console.log("Error uploading data: ", err);
                                                throw new Error('imageError');
                                            } else {
                                                unlink(tempLocation + "thumb" + UploadUrl);
                                                console.log("Successfully uploaded thumbnail to AWS");
                                                responseToClient = true;
                                                callback();
                                            }
                                        });
                                    }
                                }
                            });
                        });
                    }
                } else {
                    console.log('not a supported image format. jpg, png, exif, tiff, gif, bmp, png')
                }
            }
        });
    }
    callback(responseToClient);
}
exports.uploadProfilePicture = function (files, filename, callback) {
    var files = files;
    var img = files["image0"];
    fs.readFile(img.path, function (err, data) {
        if (err) {
            console.log("error" + err);
            return false;
        } else {
            var fileExtension = '' + getExtension(img.name);
            if ((fileExtension == 'jpg') || (fileExtension == 'png') || (fileExtension == 'tiff') || (fileExtension == 'gif') || (fileExtension == 'bmp') || (fileExtension == 'jfif') || (fileExtension == 'svg') || (fileExtension == 'cgm')) {

                var keypath = './Uploads/' + filename;
                im.resize({
                    srcData: data,
                    dstPath: keypath,
                    format: 'jpg',
                    width: 150
                }, function (err, stdout, stderr) {
                    if (err) {
                        console.log("imagemagick error: " + err);
                        // delete the files, if error happened. Or maybe try again before canceling.
                        // unlink(newPath);
                        // unlink(thumbs);
                        // try again, exit the function. (assuming return takes us out of the exported function)
                        return false;
                    } else {
                        /// write full file to temp
                        var imgData = null;
                        fs.readFile(keypath, function (err, data) {
                            imgData = data;
                            readCallback();
                        });
                        // callback needed otherwise unlinking the file wont work.
                        function readCallback() {
                            s3profileimg.putObject({Key: filename, Body: imgData}, function (err, data) {
                                if (err) {
                                    unlink(keypath);
                                    console.log("Error uploading data: ", err);
                                } else {
                                    unlink(keypath);
                                    console.log("Successfully uploaded fullpic to AWS");
                                }
                            });
                        }

                    }
                    console.log('resized image to fit within 150x150px');

                });
            }
        }
    });
    callback();

}
// photoUploadandResize takes an image file. Iterates on the variables of that image files such as name/path.
// and saves/overwrites the image on the server if their names are identical (for this we use the articleid) to ensure each article only has 1 image.
exports.photoUploadAndResize = function (articleId, filesObject, callback, res) {
    // multipart form parse output in form of "files.image0-9"
    // takes the multipart file from the form.


    d.on('error', function (err) {
        console.error(err);
        res.send(400, 'bad image');
    });
    d.run(function () {
        var ArtId = articleId;
        var files = filesObject;
        var tempLocation = './Uploads/';
        for (i = 0; i < 1; i++) {
            console.log("i=" + i);
            // vigtigt at differentiere mellem files[image0] og files[0],
            // den første er ikke en array, men returnere bare propertien image0 på files hvis den eksistere.
            if (typeof files["image" + i] !== 'undefined' && typeof files["image" + i].name !== 'undefined' && files["image" + i].name !== null && files["image" + i].name !== '') {
                var img = files["image" + i];
                console.log('passed the if statement');
                fs.readFile(img.path, function (err, data) {
                    if (err) {
                        console.log("error" + err);
                        throw new Error('imageError');
                    } else {
                        console.log('in the readfile');

                        var imageName = img.name;
                        console.log("imagename:" + imageName);
                        var fileExtension = '' + getExtension(imageName);
                        // checks picture formats
                        if ((fileExtension == 'jpg') || (fileExtension == 'png') || (fileExtension == 'tiff') || (fileExtension == 'gif') || (fileExtension == 'bmp') || (fileExtension == 'jfif') || (fileExtension == 'svg') || (fileExtension == 'cgm')) {
                            console.log('file extensions supported');
                            /// If there's an error
                            if (!imageName) {
                                console.log("There was an error")
                                throw new Error('imageError');
                            } else {

                                // create the paths where we want our files to go on server.
                                var keyName = ArtId + ".jpg";


                                // if the image is bigger than 700 resize it down to 700.
                                im.identify(img.path, function (err, pictureInfo) {
                                    if (err) {
                                        console.log(err);
                                        throw new Error('imageError');
                                    }
                                    console.log("picture uploaded width: " + pictureInfo.width);
                                    if (pictureInfo.width > 700) {
                                        im.resize({
                                            srcData: data,
                                            dstPath: tempLocation + "full" + keyName,
                                            format: 'jpg',
                                            width: 700
                                        }, function (err, stdout, stderr) {
                                            if (err) {
                                                console.log("imagemagick error: " + err);
                                                // delete the files, if error happened. Or maybe try again before canceling.
                                                // unlink(newPath);
                                                // unlink(thumbs);
                                                // try again, exit the function. (assuming return takes us out of the exported function)
                                                throw new Error('imageError');
                                            } else {
                                                /// write full file to temp
                                                var imgData = null;
                                                fs.readFile(tempLocation + "full" + keyName, function (err, data) {
                                                    if (err) {
                                                        throw new Error('imageError');
                                                    } else {
                                                        imgData = data;
                                                        readCallback();
                                                    }
                                                });
                                                // callback needed otherwise unlinking the file wont work.
                                                function readCallback() {
                                                    s3fullpics.putObject({Key: keyName, Body: imgData}, function (err, data) {
                                                        if (err) {
                                                            unlink(tempLocation + "full" + keyName);
                                                            throw new Error('imageError');
                                                            console.log("Error uploading data: ", err);
                                                        } else {
                                                            unlink(tempLocation + "full" + keyName);
                                                            console.log("Successfully uploaded fullpic to AWS");
                                                        }
                                                    });
                                                }

                                            }
                                            console.log('resized image to fit within 700px');

                                        });
                                    } else {
                                        console.log('image within 700px width, no resize needed');
                                        s3fullpics.putObject({Key: keyName, Body: data}, function (err, data) {
                                            if (err) {
                                                console.log("Error uploading data: ", err);
                                                throw new Error('imageError');
                                            } else {
                                                console.log("Successfully uploaded fullpic to AWS");
                                            }
                                        });
                                    }
                                    // write a resized file to thumbs folder
                                    im.resize({
                                        srcData: data,
                                        dstPath: tempLocation + "thumb" + keyName,
                                        width: 230,
                                        format: 'jpg'
                                    }, function (err, stdout, stderr) {
                                        if (err) {
                                            console.log("imagemagick error: " + err);
                                            // delete the files, if error happened. Or maybe try again before canceling.

                                            // try again, exit the function. (assuming return takes us out of the exported function)
                                            throw new Error('imageError');

                                        } else {


                                            console.log('resized image to fit within 230px');
                                            var imgData = null;
                                            fs.readFile(tempLocation + "thumb" + keyName, function (err, data) {
                                                if (err) {
                                                    throw new Error('imageError');
                                                } else {
                                                    imgData = data;
                                                    readCallback();
                                                }
                                            });

                                            function readCallback() {
                                                s3thumbnails.putObject({Key: keyName, Body: imgData}, function (err, data) {
                                                    if (err) {
                                                        unlink(tempLocation + "thumb" + keyName);
                                                        console.log("Error uploading data: ", err);
                                                        throw new Error('imageError');
                                                    } else {
                                                        unlink(tempLocation + "thumb" + keyName);
                                                        console.log("Successfully uploaded thumbnail to AWS");
                                                        callback();
                                                    }
                                                });
                                            }
                                        }
                                    });
                                });
                            }
                        } else {
                            console.log('not a supported image format. jpg, png, exif, tiff, gif, bmp, png')
                        }
                    }
                });
            } else {
                console.log("undefined or nothing uploaded");
                throw new Error('imageError');
            }


        } // "for loop" wrapper end

    });
}
exports.getPicture = function (filename, filesize, res) {
    // show image function, not customized for specific purpose.
    file = filename;
    console.log(file);
    console.log("directory" + appDir);
    if (filesize === 'fullpic') {
        var img = fs.readFileSync(appDir + "/Uploads/fullpics/" + file);
        res.writeHead(200, {'Content-Type': 'image/jpg' });
        res.end(img, 'binary');
    } else if (filesize === 'thumb') {
        var img = fs.readFileSync(appDir + "/Uploads/thumbs/" + file);
        res.writeHead(200, {'Content-Type': 'image/jpg' });
        res.end(img, 'binary');
    } else {
        console.log('image not here');
        res.end(400, 'image does not exist on server');
    }


}

// unlink uses the filesystem to delete a file.
// Make sure we dont leave a full pic if it failed the resize for whatever reason.
function unlink(path) {
    // delete the files, if error happened. Or maybe try again before canceling.
    fs.unlink(path, function (err) {
        if (err) {
            console.log("unlinking error.");
            console.log(err);
        } else {
            console.log('successfully deleted ' + path);
        }
    });

}