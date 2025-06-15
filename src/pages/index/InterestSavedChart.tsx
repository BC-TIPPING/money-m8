
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface InterestSavedChartProps {
  data: any[];
}

const chartConfig = {
  "50_extra": {
    label: "$50/week Extra",
    color: "hsl(var(--chart-2))",
  },
  "100_extra": {
    label: "$100/week Extra",
    color: "hsl(var(--chart-3))",
  },
  "200_extra": {
    label: "$200/week Extra",
    color: "hsl(var(--chart-4))",
  },
  "500_extra": {
    label: "$500/week Extra",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

const InterestSavedChart: React.FC<InterestSavedChartProps> = ({ data }) => {
  if (!data || data.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interest Saved Over Time</CardTitle>
        <CardDescription>
          This chart projects the cumulative interest you could save by making extra weekly repayments compared to making no extra payments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `M${value}`}
            />
            <YAxis
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={80}
            />
            <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            {Object.keys(chartConfig).map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={`var(--color-${key})`}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default InterestSavedChart
