interface GuideProperties {
	/**
	 * the background-color of the guide's text
	 *
	 * @default '#009500 | #ff0000'
	 */
	backgroundColor?: string;

	/**
	 * the color of the guide's text
	 *
	 * @default '#000'
	 */
	color?: string;

	/**
	 * the text of the guide
	 *
	 * @default 'Root Enter | Root Leave | Enter | Leave'
	 */
	text?: string;
}
interface GuideElements {
	/**
	 * the trigger's guides options
	 */
	trigger?: GuideProperties;

	/**
	 * the root's guides options
	 */
	root?: GuideProperties;
}

interface GuidesOptions {
	/**
	 * the enter guides options
	 */
	enter?: GuideElements;

	/**
	 * the leave guides options
	 */
	leave?: GuideElements;
}

interface GuidesMethods {
	/**
	 * Updates the guides' positions, mostly used if the root size change
	 */
	update(): void;

	/**
	 * kills the Guides instance, removes the guides.
	 */
	kill(): void;
}

export { GuidesOptions, GuidesMethods };
