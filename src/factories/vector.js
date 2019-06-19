import fs from 'fs';
import SVGSpriter from 'svg-sprite';
import Promise from 'bluebird';
import _ from 'lodash';

/**
 * Generate the spritesheet.
 * @param  {Object} opts
 * @param  {Array}  images
 * @return {Promise}
 */
export default function run(opts, images) {
	const config  = _.defaultsDeep({}, opts.svgsprite);
	const spriter = new SVGSpriter(config);

	images.forEach(({ path }) => {
		spriter.add(path, null, fs.readFileSync(path, { encoding: 'utf-8' }));
	});

	return Promise.promisify(spriter.compile, {
		context: spriter,
		multiArgs: true
	})().spread((result, data) => {
		const spritesheet = {};
		const mode = opts.svgSpriteMode;

		spritesheet.extension = 'svg';
		spritesheet.coordinates = {};
		spritesheet.image = result[mode].sprite.contents;
		spritesheet.properties = {
			width: data[mode].spriteWidth,
			height: data[mode].spriteHeight
		};

		data[mode].shapes.forEach((shape) => {
			spritesheet.coordinates[opts.shapePathFromId(shape.name)] = {
				width: shape.width.outer,
				height: shape.height.outer,
				x: shape.position.absolute.x,
				y: shape.position.absolute.y
			};
		});

		return spritesheet;
	});
}
