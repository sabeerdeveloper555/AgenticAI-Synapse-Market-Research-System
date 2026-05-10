import os
import requests
from crewai_tools import BaseTool
from pydantic import BaseModel, Field


class SearchInput(BaseModel):
    query: str = Field(..., description="The search query string to look up on the web")


class SerperSearchTool(BaseTool):
    name: str = "web_search"
    description: str = (
        "Search the web for current market data, news, statistics, and industry reports. "
        "Input must be a plain search query string, for example: web_search('AI market size 2024')."
    )
    args_schema: type[BaseModel] = SearchInput

    def _run(self, query: str) -> str:
        api_key = os.getenv("SERPER_API_KEY")
        if not api_key:
            return "SERPER_API_KEY not configured. Add it to your .env file."

        headers = {"X-API-KEY": api_key, "Content-Type": "application/json"}
        payload = {"q": query, "num": 8}

        try:
            response = requests.post(
                "https://google.serper.dev/search",
                headers=headers,
                json=payload,
                timeout=15,
            )
            response.raise_for_status()
            data = response.json()

            results = []
            for item in data.get("organic", []):
                title = item.get("title", "")
                snippet = item.get("snippet", "")
                link = item.get("link", "")
                results.append(f"**{title}**\n{snippet}\nSource: {link}")

            if not results:
                return "No results found for this query."

            return "\n\n".join(results[:6])

        except requests.RequestException as e:
            return f"Search failed: {str(e)}"


def get_search_tools():
    return [SerperSearchTool()]
