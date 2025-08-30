
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

interface DebtReductionChartProps {
  data: any[];
}

const chartConfig = {
  "no_extra": {
    label: "No Extra",
    color: "hsl(var(--chart-1))",
  },
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

const DebtReductionChart: React.FC<DebtReductionChartProps> = ({ data }) => {
  if (!data || data.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debt Reduction Projection</CardTitle>
        <CardDescription>
          This chart shows how your total debt balance could decrease over time with different levels of extra weekly repayments.
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
              bottom: 60,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `M${value}`}
              label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              tickFormatter={(value) => `$${(value / 1000)}k`}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={80}
            />
            <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
            />
            <ChartLegend content={<ChartLegendContent />} wrapperStyle={{ paddingTop: '3px' }} />
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

export default DebtReductionChart
