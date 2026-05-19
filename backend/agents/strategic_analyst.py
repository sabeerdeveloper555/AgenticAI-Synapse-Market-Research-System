from crewai import Agent
from langchain_openai import ChatOpenAI


def create_strategic_analyst():
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)
    return Agent(
        role="Strategic Analyst",
        goal=(
            "Analyze raw market data to produce a detailed SWOT analysis, "
            "identify key risks, growth opportunities, and strategic insights."
        ),
        backstory=(
            "You are a top-tier business strategist with an MBA from Wharton "
            "and a track record advising Fortune 500 companies. You transform "
            "raw data into structured, actionable intelligence using proven "
            "analytical frameworks including SWOT, Porter's Five Forces, and "
            "competitive benchmarking."
        ),
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=15,
        max_execution_time=180,
    )
