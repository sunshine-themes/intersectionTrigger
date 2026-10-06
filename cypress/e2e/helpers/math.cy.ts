import {
	buildRootMarginString,
	buildThreshold,
	expandRectByMargins,
	expFollowFactor,
	intersectionLength,
	parseMarginString,
	positionPixels,
	scrollDiffToSeekTime,
	seekSnapDistance,
	snapTargetsFromStep
} from '../../../src/math';

describe('parseMarginString', () => {
	it('expands a single value to all four margins', () => {
		const margin = { value: 10, unit: 'px' };
		expect(parseMarginString('10px')).to.deep.equal([margin, margin, margin, margin]);
	});

	it('handles the CSS shorthand notations', () => {
		expect(parseMarginString('10px 5%')).to.deep.equal([
			{ value: 10, unit: 'px' },
			{ value: 5, unit: '%' },
			{ value: 10, unit: 'px' },
			{ value: 5, unit: '%' }
		]);
		expect(parseMarginString('1px 2px 3px')).to.deep.equal([
			{ value: 1, unit: 'px' },
			{ value: 2, unit: 'px' },
			{ value: 3, unit: 'px' },
			{ value: 2, unit: 'px' }
		]);
		expect(parseMarginString('1px 2px 3px 4px')).to.deep.equal([
			{ value: 1, unit: 'px' },
			{ value: 2, unit: 'px' },
			{ value: 3, unit: 'px' },
			{ value: 4, unit: 'px' }
		]);
	});

	it('treats unparsable values as zero margins', () => {
		const zero = { value: 0, unit: '' };
		expect(parseMarginString('foo')).to.deep.equal([zero, zero, zero, zero]);
	});
});

describe('expandRectByMargins', () => {
	it('expands the rect by the pixel margins on each side', () => {
		expect(
			expandRectByMargins({ top: 10, right: 60, bottom: 50, left: 20 }, [
				{ value: 5, unit: 'px' },
				{ value: 6, unit: 'px' },
				{ value: 7, unit: 'px' },
				{ value: 8, unit: 'px' }
			])
		).to.deep.equal({ top: 5, right: 66, bottom: 57, left: 12, width: 54, height: 52 });
	});

	it('resolves percentage margins against height (top/bottom) and width (left/right)', () => {
		expect(
			expandRectByMargins({ top: 0, right: 100, bottom: 50, left: 0 }, [
				{ value: 10, unit: '%' },
				{ value: 10, unit: '%' },
				{ value: 10, unit: '%' },
				{ value: 10, unit: '%' }
			])
		).to.deep.equal({ top: -5, right: 110, bottom: 55, left: -10, width: 120, height: 60 });
	});
});

describe('positionPixels', () => {
	it('returns px positions as-is and percentages resolved against the total', () => {
		expect(positionPixels({ value: 50, unit: 'px', normal: 0 }, 1000)).to.equal(50);
		expect(positionPixels({ value: 10, unit: '%', normal: 0.1 }, 1000)).to.equal(100);
	});
});

describe('buildRootMarginString', () => {
	it('builds the vertical margins with the cross axis extended', () => {
		//default band: rootEnter 100% (660px), rootLeave 0%
		expect(
			buildRootMarginString({ isREPGreater: true, rEPpx: 660, rLPpx: 0, rootLength: 660, isVertical: true, extendMargin: 5000 })
		).to.equal('0px 5000px 0px 5000px');
	});

	it('keeps the enter line inside the band when the root enter is below the root leave edge', () => {
		//rootEnter 250px, rootLeave 0% -> fromRef 0px, fromOppRef 250 - 660 = -410px
		expect(
			buildRootMarginString({ isREPGreater: true, rEPpx: 250, rLPpx: 0, rootLength: 660, isVertical: true, extendMargin: 5000 })
		).to.equal('0px 5000px -410px 5000px');
	});

	it('orders the margins for the horizontal axis', () => {
		expect(
			buildRootMarginString({ isREPGreater: false, rEPpx: 100, rLPpx: 400, rootLength: 500, isVertical: false, extendMargin: 3000 })
		).to.equal('3000px -100px 3000px -100px');
	});
});

describe('buildThreshold', () => {
	it('always includes 0 and 1 and deduplicates the trigger positions', () => {
		expect(
			buildThreshold([
				{ enter: 0, leave: 1, higher: 1 },
				{ enter: 0.5, leave: 0.75, higher: 0.75 }
			])
		).to.deep.equal([0, 1, 0.5, 0.75, 0.25]);
	});

	it('rounds the 1 - higher ratio to two decimals', () => {
		expect(buildThreshold([{ enter: 0, leave: 1, higher: 0.333 }])).to.deep.equal([0, 1, 0.67]);
	});
});

describe('scrollDiffToSeekTime', () => {
	it('maps the scroll distance to the animation time linearly', () => {
		expect(scrollDiffToSeekTime(340, 1060, 1000)).to.be.closeTo(320.75, 0.01);
	});

	it('clamps to the duration and to zero', () => {
		expect(scrollDiffToSeekTime(5000, 1060, 1000)).to.equal(1000);
		expect(scrollDiffToSeekTime(-10, 1060, 1000)).to.equal(0);
	});
});

describe('seekSnapDistance', () => {
	it('converts a time distance to a scroll distance', () => {
		expect(seekSnapDistance(1060, 245, 1000)).to.equal(259.7);
	});
});

describe('snapTargetsFromStep', () => {
	it('builds the evenly spaced targets across the duration', () => {
		expect(snapTargetsFromStep(0.25, 1000)).to.deep.equal([0, 250, 500, 750, 1000]);
	});

	it('degenerates to the start target for a zero or negative step', () => {
		expect(snapTargetsFromStep(0, 1000)).to.deep.equal([0]);
		expect(snapTargetsFromStep(-0.5, 1000)).to.deep.equal([0]);
	});

	it('clamps to the animation bounds for steps above 1', () => {
		expect(snapTargetsFromStep(2, 1000)).to.deep.equal([0]);
		expect(snapTargetsFromStep(1, 1000)).to.deep.equal([0, 1000]);
	});
});

describe('intersectionLength', () => {
	it('is the trigger size share between the lower and higher positions', () => {
		expect(intersectionLength(400, 0, 1)).to.equal(400);
		expect(intersectionLength(300, 0.1, 0.5)).to.equal(120);
		expect(intersectionLength(300, 0.5, 0.1)).to.equal(-120);
	});
});

describe('expFollowFactor', () => {
	it('covers ~63.2% of the remaining distance after one time constant', () => {
		expect(expFollowFactor(100, 100)).to.be.closeTo(0.632, 0.001);
	});

	it('is 0 for a zero delta and grows monotonically with the elapsed time', () => {
		expect(expFollowFactor(0, 100)).to.equal(0);
		expect(expFollowFactor(200, 100)).to.be.greaterThan(expFollowFactor(100, 100));
	});
});
