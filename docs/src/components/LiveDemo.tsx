import { useState, useRef, useEffect } from 'react';

interface LiveDemoProps {
	height?: string;
	template?: string;
	style?: string;
	code?: string;
	title?: string;
}

export default function LiveDemo({
	height = '400px',
	template = '<div class="box"></div>',
	style = '',
	code = '',
	title = 'Live Demo',
}: LiveDemoProps) {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [events, setEvents] = useState<string[]>([]);

	useEffect(() => {
		const handler = (e: MessageEvent) => {
			if (e.data?.type === 'it-event') {
				setEvents((prev) => [...prev.slice(-9), e.data.name]);
			}
		};
		window.addEventListener('message', handler);
		return () => window.removeEventListener('message', handler);
	}, []);

	const srcdoc = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; padding: 20px; font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100%; }
  .box { width: 100px; height: 100px; background: #FFBF00; border-radius: 12px; margin: 20px auto; opacity: 0; transform: translateY(30px); transition: all 0.5s ease; }
  .box.active { opacity: 1; transform: translateY(0); }
  ${style}
</style>
</head>
<body>
  <div style="height: ${height}; overflow-y: auto; padding: 1rem;">
    <div style="height: ${height};"></div>
    ${template}
    <div style="height: ${height};"></div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/intersectiontrigger@latest/intersectiontrigger-bundle.browser.mjs" type="module"></script>
  <script type="module">
    const IT = await import('https://cdn.jsdelivr.net/npm/intersectiontrigger@latest/intersectiontrigger-bundle.browser.mjs');
    const IntersectionTrigger = IT.default;
    const instance = new IntersectionTrigger();

    function notify(name) {
      window.parent.postMessage({ type: 'it-event', name }, '*');
    }

    ${code.replace(
		/new IntersectionTrigger\([^)]*\)/g,
		'instance'
	).replace(
		/const\s+\w+\s*=\s*new IntersectionTrigger\([^)]*\)\s*;?/g,
		''
	).replace(
		/instance\.add\(/g,
		'instance.add('
	)}
  </script>
</body>
</html>`;

	return (
		<div className="live-demo">
			<div className="live-demo-header">
				<span>{title}</span>
			</div>
			<iframe
				ref={iframeRef}
				className="live-demo-frame"
				style={{ height }}
				srcDoc={srcdoc}
				title={title}
				sandbox="allow-scripts allow-same-origin"
			/>
			{events.length > 0 && (
				<div className="event-log">
					{events.map((evt, i) => (
						<div key={i} className="event-log-entry">
							<span className="event-name">{evt}</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
