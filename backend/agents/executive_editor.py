from crewai import Agent
from langchain_openai import ChatOpenAI


def create_executive_editor():
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)
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
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=8,
    )
