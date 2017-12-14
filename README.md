# Udacity The Neighborhood Map

> Developed for [Udacity Front-end Web Developer Nanodegree]

A single page application featuring a map of my neighborhood, with functionalities including map markers to identify recommended places from [Foursquare API], a search function to easily discover these places, and a listview to support simple browsing of all places.

## APIs:

- [Google Maps JavaScript API]
- [Foursquare API]

## Getting Started

### Live Example

A running example of the release 0.0.1 is available [here](https://huks.github.io/udacity-neighborhood-map/).

### Download the source

```
git clone https://github.com/huks/udacity-neighborhood-map.git
```

### Install Bower

Bower is a command line utility. Install it with npm.

```
$ npm install -g bower
```

Bower requires [nodes, npm] and [git].

### Install dependencies

Installs the project dependencies listed in `bower.json` to `app/components/`.

```
$ bower install
```

### Run the application

Open `app/index.html` file in your favorite browser.

## Tools Used

- [Knockout.js]
- [Bootstrap]
- [Snazzy Info Window]

## Todos

- Add the venue photo loading UI.
- Improve the pan animation timing after creating the Info Window
- Fix the dependency tree isue of Google Maps and Snazzy Info Window (currently 'resolved' by not using aync defer, need improvements) - Use Gulp or Webpack perhaps?

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job.)

[Udacity Front-end Web Developer Nanodegree]: <https://www.udacity.com/course/front-end-web-developer-nanodegree--nd001>
[Vanilla JS]: <http://vanilla-js.com>
[Google Maps JavaScript API]: <https://developers.google.com/maps/documentation/javascript/>
[Foursquare API]: https://developer.foursquare.com/
[nodes, npm]: https://nodejs.org/en/
[git]: https://git-scm.com/
[Knockout.js]: http://knockoutjs.com/
[Bootstrap]: https://getbootstrap.com/
[Snazzy Info Window]: https://github.com/atmist/snazzy-info-window

