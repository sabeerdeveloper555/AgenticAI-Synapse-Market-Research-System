from crewai import Agent


def create_executive_editor():
    return Agent(
        role="Executive Editor",
        goal=(
            "Transform strategic analysis into a polished, professional "
            "market research report with clear headings, concise summaries, "
            "and actionable recommendations — formatted in clean Markdown."
        ),
        backstory=(
            "You are an award-winning business journalist and former editor "
            "at McKinsey Quarterly. You have an unmatched ability to distill "
            "complex analysis into crisp, executive-ready prose. Your reports "
            "are known for clarity, structure, and actionable takeaways."
        ),
        llm="gpt-4o-mini",
        verbose=False,
        allow_delegation=False,
        max_iter=4,
        max_execution_time=120,
    )
