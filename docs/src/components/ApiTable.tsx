interface ApiTableProps {
	rows: Array<{
		property: string;
		type: string;
		default?: string;
		description: string;
	}>;
	showDefault?: boolean;
}

export default function ApiTable({ rows, showDefault = true }: ApiTableProps) {
	return (
		<table className="api-table">
			<thead>
				<tr>
					<th>Property</th>
					<th>Type</th>
					{showDefault && <th>Default</th>}
					<th>Description</th>
				</tr>
			</thead>
			<tbody>
				{rows.map((row, i) => (
					<tr key={i}>
						<td><code>{row.property}</code></td>
						<td><code>{row.type}</code></td>
						{showDefault && <td><code>{row.default || '—'}</code></td>}
						<td>{row.description}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
