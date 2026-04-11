from app.core.carbon_service import GlobalCarbonRegistry

# Centralized registry instance to avoid circular imports between main.py and nodes.py
registry = GlobalCarbonRegistry()
