# [gulp](http://gulpjs.com)-pofill

> Transform given set of PO files using simple callbacks


## Install

Install with [npm](https://npmjs.org/package/gulp-pofill)

```sh
npm install --save-dev gulp-pofill
```


## API

```js
var gulp = require('gulp');
var pofill = require('gulp-pofill');

gulp.task('translations', function () {
    return gulp.src('po/**/*.po')
        .pipe(pofill({
            comments: function(comment) {
                // manipulate comment or return a new one
                return comment;
                // Or a promise which resolves to `comment`
            },
            headers: function(header) {
                // manipulate header or return a new one
                return header;
                // Or a promise which resolves to `header`
            },
            items: function(item) {
                // manipulate item or return a new one
                // item is instance of [PO.Item](https://github.com/rubenv/pofile#the-poitem-class)
                return item;
                // Or a promise which resolves to `item`
            }
        }))
        .pipe(gulp.dest('dist/translations/'));
});
```

Note that all callbacks are async, i.e. you can return a promise which resolves to
the manipulated comment, header, or item.

## Example

For example, the gulp-angular-gettext plugin will output an empty json if PO file
contains empty translations. In some cases this is expected, and you'd write
something like following:

```js
var gulp = require('gulp');
var pofill = require('gulp-pofill');
var gettext = require('gulp-angular-gettext');

gulp.task('translations', function () {
    return gulp.src('po/**/*.po')
        .pipe(gettext.compile({format: 'json'}))
        .pipe(gulp.dest('dist/translations/'));
});
```

But in many other cases, you want to fillup the translation strings with the
same strings as translations (for example, when)

```js
var gulp = require('gulp');
var pofill = require('gulp-pofill');
var gettext = require('gulp-angular-gettext');

gulp.task('translations', function () {
    return gulp.src('po/**/*.po')
        .pipe(pofill({
            items: function(item) {
                // If msgstr is empty, use identity translation
                if (!item.msgstr.length) {
                    item.msgstr.push(item.msgid);
                }
                return item;
            }
        }))
        .pipe(gettext.compile({format: 'json'}))
        .pipe(gulp.dest('dist/translations/'));
});
```

