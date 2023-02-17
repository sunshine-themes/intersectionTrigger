interface GuidesParams {
	enter: boolean;
	isHigherValue: boolean;
	text: string;
	color: string;
	backgroundColor: string;
}
interface GuideProperties {
	backgroundColor?: string;
	color?: string;
	text?: string;
}
interface GuideElements {
	trigger?: GuideProperties;
	root?: GuideProperties;
}
interface GuidesOptions {
	enter?: GuideElements;
	leave?: GuideElements;
}

export type { GuidesParams, GuidesOptions };
