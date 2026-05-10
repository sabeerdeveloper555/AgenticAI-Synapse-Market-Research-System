from crewai import Agent
from langchain_openai import ChatOpenAI


def create_trend_researcher(tools):
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)
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
        llm=llm,
        verbose=True,
        allow_delegation=False,
        max_iter=10,
    )
