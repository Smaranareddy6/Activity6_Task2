async function drawChart() {
  try {
    const data = await d3.csv("data.csv");

    data.forEach(d => {
      d["below_5_5"] = +d["below_5_5"];
      d["5_to_6_5"] = +d["5_to_6_5"];
      d["6_5_to_7_5"] = +d["6_5_to_7_5"];
      d["7_5_to_8_5"] = +d["7_5_to_8_5"];
      d["above_8_5"] = +d["above_8_5"];
    });

    const keys = ["below_5_5", "5_to_6_5", "6_5_to_7_5", "7_5_to_8_5", "above_8_5"];
    const stackedData = d3.stack().keys(keys)(data);

    const margin = { top: 40, right: 200, bottom: 40, left: 150 };
    const width = 1000 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select("#visualization")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, 1]).range([0, width]);
    const yScale = d3.scaleBand().domain(data.map(d => d.Genre)).range([0, height]).padding(0.1);

    const color = d3.scaleOrdinal()
  .domain(keys)
  .range([
    "#a3d5ff", // below_5_5 - sky blue
    "#ffe680", // 5_to_6_5 - pastel yellow
    "#a1e3a1", // 6_5_to_7_5 - soft green
    "#ff9eb3", // 7_5_to_8_5 - light pink
    "#b0a8b9"  // above_8_5 - dusty lavender
  ]);

    const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

    svg.append("g")
      .selectAll("g")
      .data(stackedData)
      .join("g")
      .attr("fill", d => color(d.key))
      .selectAll("rect")
      .data(d => d)
      .join("rect")
      .attr("class", "bar")
      .attr("y", d => yScale(d.data.Genre))
      .attr("x", d => xScale(d[0]))
      .attr("width", d => xScale(d[1]) - xScale(d[0]))
      .attr("height", yScale.bandwidth())
      .on("mouseover", (event, d) => {
        const percentage = ((d[1] - d[0]) * 100).toFixed(1);
        tooltip.transition().duration(100).style("opacity", 1);
        tooltip.html(`${percentage}%`).style("left", event.pageX + 10 + "px").style("top", event.pageY - 25 + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0);
      });

    svg.append("g").call(d3.axisLeft(yScale));
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format(".0%")));

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("fill", "#333")
      .text("Rating according to genres");

    const legend = svg.selectAll(".legend")
      .data(keys)
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(${width + 20}, ${i * 25})`);

    legend.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", d => color(d));

    legend.append("text")
      .attr("x", 24)
      .attr("y", 13)
      .text(d => {
        switch (d) {
          case "below_5_5": return "below 5.0";
          case "5_to_6_5": return "5.0–6.5";
          case "6_5_to_7_5": return "6.5–7.5";
          case "7_5_to_8_5": return "7.5–8.5";
          case "above_8_5": return "above 8.5";
        }
      });
  } catch (error) {
    console.error("Error drawing chart:", error);
  }
}

drawChart();