from crewai import Agent


def create_trend_researcher(tools):
    return Agent(
        role="Trend Researcher",
        goal=(
            "Collect the latest market trends, statistics, industry reports, "
            "and emerging patterns for the given topic using live web search."
        ),
        backstory=(
            "You are a seasoned market intelligence analyst with 15 years of "
            "experience scanning global data sources. You specialize in finding "
            "factual, current data from authoritative sources and summarizing "
            "key developments with precision."
        ),
        tools=tools,
        llm="gpt-4o-mini",
        verbose=False,
        allow_delegation=False,
        max_iter=8,
        max_execution_time=240,
    )
