import { useNavigate } from "react-router-dom";

export default function Dashboard() {
	const navigate = useNavigate();
	return (
		<div className="Body" style={{ paddingTop: 24 }}>
			<h2>Dashboard</h2>
			<p>Manage quizzes, submissions, and grading.</p>

			<div style={{ marginTop: 24 }}>
				<button
					onClick={() => navigate("/grade")}
					style={{
						padding: "10px 18px",
						background: "#e8def8",
						border: "1px solid #c9c1dc",
						borderRadius: 20,
						cursor: "pointer",
					}}
				>
					Start Grading
				</button>
			</div>
		</div>
	);
}

