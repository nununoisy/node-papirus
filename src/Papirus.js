import AsyncOpQueue from './AsyncOpQueue';
import Epd from './Epd';
import EpdButtons from './EpdButtons';
import PapirusImage from './PapirusImage';

/**
 * Class representing the interface to the Papirus.
 * @class
 */
export default class Papirus {
	/**
	 * Creates a new Papirus interface.
	 *
	 * @param {Number} width - Width of the screen.
	 * @param {Number} height - Height of the screen.
	 * @param {Boolean} piZero - True for Papirus Zero, false otherwise. Used for mapping button events.
	 */
	constructor(width, height, piZero) {
		this.width = width;
		this.height = height;
		this.queue = new AsyncOpQueue();
		this.epd = new Epd();
		this.buttons = new EpdButtons(piZero);
		this.image = new PapirusImage(this.width, this.height);
	}
	/**
	 * Resets the EPD FUSE library.
	 * @returns {Papirus}
	 */
	reset() {
		return this.epd.clear().then(() => {
			return this;
		});
	}
	/**
	 * Clears the Papirus screen buffer.
	 * @returns {Papirus}
	 */
	clear() {
		this.queue.push(() => {
			this.image = new PapirusImage(this.width, this.height);
			return this;
		});
		return this;
	}
	/**
	 * Draws an image to the screen buffer.
	 *
	 * @param {(string|Buffer)} path - Path to image or Buffer containing image data.
	 * @param {Boolean} [dither=true] - Whether to use dithering during color to monochrome conversion.
	 * @param {Number} [x=0] - X position of the image.
	 * @param {Number} [y=0] - Y position of the image.
	 * @returns {Papirus}
	 */
	addImage(path, dither = true, x = 0, y = 0) {
		this.queue.push(() => {
			console.log(`Opening image '${path}'...`);
			return this.image.addImage(path, dither, x, y)
				.then((image) => {
					console.log('Image opened.');
					return this;
				})
				.catch((err) => {
					console.log('Error opening image: ' + err);
				});
			});
		return this;
	}
	/**
	 * Draws text to the screen buffer.
	 *
	 * @param {string} text - Text to draw.
	 * @param {string} font - Path to a .fnt bitmap font file.
	 * @param {Number} [x=0] - X position of text.
	 * @param {Number} [y=0] - Y position of text.
	 * @returns {Papirus}
	 */
	addText(text, font, x = 0, y = 0, id = null) {
		console.log(`Writing "${text}" at (${x},${y})`);
		this.queue.push(() => {
			return this.image.addText(text, font, x, y)
		});
		return this;
	}
	/**
	 * Write the screen buffer to the Papirus screen.
	 *
	 * @param {Boolean} [partial=false] - Whether to perform a partial (fast) or full (clean) update.
	 * @returns {Boolean} - True on success.
	 */
	write(partial = false) {
		this.queue.push(() => {
			return this.image
				.toBuffer()
				.then((buffer) => {
					this.epd.display(buffer);
					if (partial) {
						this.epd.partialUpdate();
					}
					else {
						this.epd.update();
					}
				})
				.catch((err) => {
					console.log(err);
				});
		});
		return this.done();
	}
	/**
	 * Writes the screen buffer to an image file.
	 *
	 * @param {string} path - Path to write image file to.
	 * @returns {Boolean} - True if success.
	 */
	writeToFile(path) {
		this.queue.push(() => {
			console.log(`Writing image to file ${path}...`);
			return this.image
				.writeToFile(path)
				.then(() => {
					console.log('Image written.');
				})
				.catch((err) => {
					console.log(err);
				});
		});
		return this.done();
	}
	/**
	 * Builds the screen buffer without writing it.
	 * @returns {Papirus}
	 */
	done() {
		return this.queue.execute().then(() => {
			return this;
		});
	}
	/**
	 * Assigns an event handler to a button press event. Can be stacked.
	 *
	 * @param {Number} index - Zero-indexed button number.
	 * @param {Papirus~buttonCallback} cb - Button event handler.
	 */
	onButton(index, cb) {
		this.buttons.listen(index, cb);
	}
	/**
	 * Callback for a button event.
	 * @callback Papirus~buttonCallback
	 * @param {Onoff~Gpio} button - Onoff GPIO object representing the GPIO attached to the button.
	 */
	static get FONT_SANS_8_BLACK() { return PapirusImage.FONT_SANS_8_BLACK; }
	static get FONT_SANS_16_BLACK() { return PapirusImage.FONT_SANS_16_BLACK; }
	static get FONT_SANS_32_BLACK() { return PapirusImage.FONT_SANS_32_BLACK; }
	static get FONT_SANS_64_BLACK() { return PapirusImage.FONT_SANS_64_BLACK; }
	static get FONT_SANS_128_BLACK() { return PapirusImage.FONT_SANS_128_BLACK; }
};
