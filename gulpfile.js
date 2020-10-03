'use strict';


const projectFolder = 'dist';
const sourceFolder = '#src';

const path = {
    build: {
        html: projectFolder + '/',
        css: projectFolder + '/css/',
        js: projectFolder + '/js/',
        img: projectFolder + '/img/',
        fonts: projectFolder + '/fonts/',
        php: projectFolder + '/',
    },

    src: {
        html: [sourceFolder + '/*.html', '!' + sourceFolder + '/htm/_*.html'],
        css: sourceFolder + '/scss/style.scss',
        js: sourceFolder + '/js/script.js',
        img: sourceFolder + '/img/**/*.{jpg,png,svg,ico,gif,webp}',
        svg: sourceFolder + '/img/svg/**.svg',
        fonts: sourceFolder + '/fonts/*.{woff,woff2}',
        php: sourceFolder + '/*.php',
    },

    watch: {
        html: sourceFolder + '/**/*.html',
        css: sourceFolder + '/scss/**/*.scss',
        js: sourceFolder + '/js/**/*.js',
        img: sourceFolder + '/img/**/*.{jpg,png,svg,ico,gif,webp}',
        svg: sourceFolder + './#src/img/svg/**.svg',
        php: sourceFolder + '/**/*.php',
    },

    clean: './' + projectFolder + '/'
}


const { src, dest } = require('gulp');
const gulp = require('gulp');
const browserSync = require('browser-sync').create();
let fileInclude = require('gulp-file-include');
const del = require('del');
const scss = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const svgSprite = require('gulp-svg-sprite');
const rename = require("gulp-rename");
const uglify = require('gulp-uglify-es').default;
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');


const browser = () => {
    browserSync.init({
        server: {
            baseDir: './' + projectFolder + '/'
        },

        port: 3000,
        notify: false
    })
}


const html = () => {
    return src(path.src.html)
        .pipe(fileInclude())

        .pipe(dest(path.build.html))
        .pipe(browserSync.stream())
}

const php = () => {
    return src(path.src.php)
        .pipe(dest(path.build.php))
        .pipe(browserSync.stream())
}

const css = () => {
    return src(path.src.css)
        .pipe(scss({ outputStyle: 'expanded' }))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 5 versions'],
            cascade: true
        }))
        .pipe(dest(path.build.css))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(cleanCSS({ level: 2 }))
        .pipe(dest(path.build.css))
        .pipe(browserSync.stream())
}


const svgSprites = () => {
    return src(path.src.svg)
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: "../sprite.svg"
                },
            }
        }))
        .pipe(dest(path.build.img))
}


const js = () => {
    return src(path.src.js)
        .pipe(fileInclude())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(dest(path.build.js))
        .pipe(browserSync.stream())
}


const images = () => {
    return src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            interlaced: true,
            optomizationLevel: 4
        }))
        .pipe(dest(path.build.img))
        .pipe(browserSync.stream())
}

const fonts = () => {
    return src(path.src.fonts)
        .pipe(dest(path.build.fonts))
}


const watchFiles = () => {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
    gulp.watch([path.watch.img], svgSprites);

}

const clean = () => {
    return del(path.clean);
}

const build = gulp.series(clean, gulp.parallel(js, css, html, images, svgSprites, fonts, php));
const watch = gulp.parallel(build, watchFiles, browser);

exports.fonts = fonts;
exports.images = images;
exports.svgSprites = svgSprites;
exports.js = js;
exports.css = css;
exports.html = html;
exports.php = php;
exports.build = build;
exports.watch = watch;
exports.default = watch;

