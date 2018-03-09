module.exports = function(grunt) {
    // rub patched issue/2006
    return {
        options: {
            courseFile: 'course/*/course.<%= jsonext %>',
            blocksFile: 'course/*/blocks.<%= jsonext %>'
        }
    };
};
