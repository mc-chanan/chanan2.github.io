# EVs (Electric Vehicles) and PHEVs (Plug-in Hybrids) Sales (2010 - 2024)

The global electric vehicle (EV) market has experienced remarkable growth over the last decade, transforming from a niche market into a significant force within the automotive industry. This project uses the global and countries-specific sales data from International Energy Agency (IEA) and provides a web tool to the users to explore this data. The tool can be accessed from https://mc-chanan.github.io/chanan2.github.io/

## Narrative Visualization Concepts Applied

### 1. Messaging

This project communicates the story of electric and plug-in hybrid vehicles adoption globally, showing how both EVs and PHEVs have grown from 2010 to 2024. The messaging follows a funnel approach: starting with global trends, then showing which countries are leading adoption, and finally allowing exploration of individual country patterns. The key insight demonstrates the rapid growth trajectory of electric vehicles worldwide, using annotations to show periods of steepest growth for different countries.

### 2. Narrative Structure

The visualization follows an **Interactive Slide Show structure**. It has three distinct scenes that users navigate through sequentially using Previous/Next buttons, but each scene presents different aspects of the same dataset. The drill-down opportunity occurs in the final scene where users can select specific countries to explore detailed trends. The structure progresses from broad (global) to narrow (country-specific) perspective.

### 3. Visual Structure

Each scene uses a different chart type optimized for its purpose with deailed text description for each scene on the right hand side.

- **Scene 1**: Line chart for temporal trends (global overview)
- **Scene 2**: Horizontal bar chart for ranking/comparison (top 25 countries)
- **Scene 3**: Line chart with annotations for detailed analysis (country-specific)

The visual structure ensures understanding through:

- Consistent color coding (blue for EVs, red for PHEVs)
- Clear legends and axis labels
- Grid lines and proper scaling
- Animated transitions that draw attention to data entry

The highlighting strategy includes:

- Animated line drawing to focus attention on growth patterns
- Golden circle annotations marking steepest growth periods
- Color-coded legends for easy reference

### 4. Scenes

The three scenes are ordered strategically:

1. **Global Overview:** Shows overall EV/PHEV sales trends worldwide
2. **Country Ranking:** Reveals which countries have highest cumulative sales
3. **Country Deep-dive:** Allows exploration of individual country patterns

This ordering follows a logical narrative flow from general context to specific insights, allowing viewers to understand the big picture before diving into details.

### 5. Annotations

The annotations (used in scene# 3) follow a callout template with:

- Golden and red circles marking significant data points
- Arrow indicators pointing to important features
- Text boxes with contextual information
- Rocket emoji (🚀) to emphasize "steepest growth"

The annotations specifically highlight periods of steepest growth in Scene 3, supporting the message that EV adoption has accelerated dramatically in certain periods. The annotations are dynamic - they only appear in Scene 3 and are specific to each selected country, changing based on the calculated steepest slope periods.

### 6. Parameters

Key parameters include:

- currentScene: Integer (0-2) defining which scene is active
- selectedCountry: String defining which country data to display in Scene 3
- Data filtering: Country-specific subsets of the main datasets

States are defined by:

- Scene number (which chart type and data view)
- Selected country (which country's data to show in Scene 3)
- Button states (Previous/Next scene)

### 7. Triggers

The triggers connecting user actions to state changes:
1. Next/Previous buttons: Change scene state
   - Affordance: Clearly labeled buttons, disabled states shown through gray styling
2. Country dropdown: Changes selected country parameter
   - Affordance: Standard HTML select element with clear labeling
3. Button visual feedback:
   - Gray background when disabled (first/last scenes)
   - Normal styling when active

The affordances clearly communicate available actions through familiar UI patterns (buttons and dropdown menus) and visual feedback (disabled states, hover effects from CSS).

The visualization effectively combines structured storytelling with interactive exploration, guiding users through a logical progression while providing opportunities for detailed investigation in the final scene.

## Usage

- **Go to Website:** https://mc-chanan.github.io/chanan2.github.io/
- Use **Next/Previous Buttons** to navigate through the scenes.
- Use **Country Dropdown** to select a country to see its EVs and PHEVs sales growth

## License

MIT License.

## Acknowledgements

This project uses Global EV Outlook data from https://www.iea.org/data-and-statistics/data-tools/global-ev-data-explorer


---


