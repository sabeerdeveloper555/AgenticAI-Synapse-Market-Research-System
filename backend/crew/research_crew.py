from crewai import Crew, Task, Process
from agents.trend_researcher import create_trend_researcher
from agents.strategic_analyst import create_strategic_analyst
from agents.executive_editor import create_executive_editor
from tools.search_tools import get_search_tools


def run_research(topic: str, emit_log=None) -> str:
    def log(agent, message, status="working"):
        if emit_log:
            emit_log(agent, message, status)

    search_tools = get_search_tools()

    log("Trend Researcher", f'Initializing research on: "{topic}"', "started")
    trend_researcher = create_trend_researcher(search_tools)

    log("Strategic Analyst", "Preparing analysis framework...", "started")
    strategic_analyst = create_strategic_analyst()

    log("Executive Editor", "Standing by to compile final report...", "started")
    executive_editor = create_executive_editor()

    # Task 1: Trend Research
    research_task = Task(
        description=(
            f"Conduct comprehensive market research on: **{topic}**\n\n"
            "Your deliverable must include:\n"
            "1. Current market size and growth rate (with statistics)\n"
            "2. Top 5-8 key trends shaping this market in 2024-2025\n"
            "3. Major players and competitive landscape overview\n"
            "4. Recent developments (last 6-12 months)\n"
            "5. Emerging technologies or innovations in this space\n"
            "6. Key market segments and their performance\n\n"
            "Search for recent data, industry reports, and news articles. "
            "Be specific with numbers, percentages, and sources."
        ),
        expected_output=(
            "A detailed research brief with current statistics, trend analysis, "
            "competitive landscape, and factual data points — minimum 600 words."
        ),
        agent=trend_researcher,
        callback=lambda output: log(
            "Trend Researcher", "Research complete. Passing to Strategic Analyst.", "done"
        ),
    )

    # Task 2: SWOT Analysis
    analysis_task = Task(
        description=(
            f"Using the research data provided, perform a deep strategic analysis of: **{topic}**\n\n"
            "Deliver:\n"
            "1. **SWOT Analysis** — 4-6 detailed points per quadrant (Strengths, Weaknesses, "
            "Opportunities, Threats)\n"
            "2. **Key Insights** — 3-5 critical observations from the data\n"
            "3. **Risk Matrix** — Top 5 risks with probability and impact ratings\n"
            "4. **Growth Opportunities** — ranked by potential value\n"
            "5. **Competitive Positioning** — who is winning and why\n\n"
            "Base your analysis strictly on the research data. Be analytical, precise, and insightful."
        ),
        expected_output=(
            "A structured strategic analysis with complete SWOT matrix, risk assessment, "
            "and growth opportunity ranking — minimum 700 words."
        ),
        agent=strategic_analyst,
        context=[research_task],
        callback=lambda output: log(
            "Strategic Analyst", "Analysis complete. Passing to Executive Editor.", "done"
        ),
    )

    # Task 3: Final Report
    report_task = Task(
        description=(
            f"Using all research and analysis provided, write a professional market research report on: **{topic}**\n\n"
            "The report must follow this exact structure:\n\n"
            "# [Topic] — Market Research Report\n"
            "*(Prepared by Synapse Agentic AI | [Current Date])*\n\n"
            "## Executive Summary\n"
            "## Market Overview\n"
            "## Key Market Trends\n"
            "## SWOT Analysis\n"
            "## Competitive Landscape\n"
            "## Growth Opportunities\n"
            "## Risk Assessment\n"
            "## Strategic Recommendations\n"
            "## Conclusion\n\n"
            "Format in clean Markdown. Use tables where appropriate. "
            "Professional tone throughout. Minimum 1000 words total."
        ),
        expected_output=(
            "A complete, publication-ready market research report in Markdown format "
            "with all sections filled, tables, and actionable recommendations."
        ),
        agent=executive_editor,
        context=[research_task, analysis_task],
        callback=lambda output: log(
            "Executive Editor", "Final report compiled successfully.", "done"
        ),
    )

    log("system", "Launching CrewAI multi-agent workflow...", "working")

    crew = Crew(
        agents=[trend_researcher, strategic_analyst, executive_editor],
        tasks=[research_task, analysis_task, report_task],
        process=Process.sequential,
        verbose=True,
    )

    result = crew.kickoff()
    log("system", "All agents completed. Report ready.", "done")
    return str(result)
