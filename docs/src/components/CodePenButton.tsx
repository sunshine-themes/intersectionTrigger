interface CodePenButtonProps {
	html?: string;
	css?: string;
	js?: string;
}

export default function CodePenButton({ html = '', css = '', js = '' }: CodePenButtonProps) {
	const payload = JSON.stringify({
		html,
		css,
		js,
		js_external: 'https://cdn.jsdelivr.net/npm/intersectiontrigger@latest/intersectiontrigger-bundle.browser.mjs',
	});

	return (
		<form
			action="https://codepen.io/pen/define"
			method="POST"
			target="_blank"
			style={{ display: 'inline-block' }}
		>
			<input type="hidden" name="data" value={payload} />
			<button type="submit" className="btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
				Open in CodePen
			</button>
		</form>
	);
}
