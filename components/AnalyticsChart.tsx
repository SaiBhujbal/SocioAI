'use client'

import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, AreaChart,
  Area, ResponsiveContainer
} from 'recharts'
import { Button } from './ui/button'
import { motion, AnimatePresence } from 'framer-motion'

interface AnalyticsChartProps {
  data: {
    headers: string[]
    data: (string | number)[][]
  }
}

export default function AnalyticsChart({ data }: AnalyticsChartProps) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'radar' | 'area'>('bar')

  // Data validation
  if (!data?.headers || !data?.data) {
    console.error('Invalid data structure:', data)
    return null
  }

  // Debug logs
  console.log('Raw headers:', data.headers)
  console.log('Raw data:', data.data)

  // Filter metric headers (excluding Post Type/Post_id/Total Posts)
  const metricHeaders = data.headers.filter(header => 
    !['Post Type', 'post_id', 'Total Posts'].includes(header)
  )

  // Get indices for metrics
  const metricsIndices = metricHeaders.reduce<Record<string, number>>((acc, header) => ({
    ...acc,
    [header]: data.headers.indexOf(header)
  }), {})

  // Transform data for chart consumption
  const transformedData = data.data.slice(0, 3).map((row) => {
    if (!row || row.length === 0) return null

    return {
      name: row[0], // Post Type from first column
      ...metricHeaders.reduce((acc, header) => ({
        ...acc,
        [header]: Number(row[metricsIndices[header]]) || 0
      }), {})
    }
  }).filter(Boolean)

  console.log('Transformed data:', transformedData)

  // Dynamic chart colors based on metrics
  const chartColors = metricHeaders.reduce<Record<string, string>>((acc, header, index) => ({
    ...acc,
    [header]: ['#FF6B6B', '#4ECDC4', '#45B7D1'][index]
  }), {})

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transformedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" tick={{ fill: '#fff' }} />
              <YAxis tick={{ fill: '#fff' }} />
              <Tooltip contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }} />
              <Legend />
              {Object.entries(chartColors).map(([key, color]) => (
                <Bar key={key} dataKey={key} fill={color} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={transformedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" tick={{ fill: '#fff' }} />
              <YAxis tick={{ fill: '#fff' }} />
              <Tooltip contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }} />
              <Legend />
              {Object.entries(chartColors).map(([key, color]) => (
                <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={transformedData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#fff' }} />
              <PolarRadiusAxis stroke="#fff" tick={{ fill: '#fff' }} />
              <Tooltip contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }} />
              <Legend />
              {Object.entries(chartColors).map(([key, color]) => (
                <Radar key={key} name={key} dataKey={key} stroke={color} fill={color} fillOpacity={0.3} />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        )
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={transformedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" tick={{ fill: '#fff' }} />
              <YAxis tick={{ fill: '#fff' }} />
              <Tooltip contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }} />
              <Legend />
              {Object.entries(chartColors).map(([key, color]) => (
                <Area key={key} type="monotone" dataKey={key} stroke={color} fill={color} fillOpacity={0.3} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-2">
        <Button variant={chartType === 'bar' ? 'secondary' : 'outline'} onClick={() => setChartType('bar')}>
          Bar
        </Button>
        <Button variant={chartType === 'line' ? 'secondary' : 'outline'} onClick={() => setChartType('line')}>
          Line
        </Button>
        <Button variant={chartType === 'radar' ? 'secondary' : 'outline'} onClick={() => setChartType('radar')}>
          Radar
        </Button>
        <Button variant={chartType === 'area' ? 'secondary' : 'outline'} onClick={() => setChartType('area')}>
          Area
        </Button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={chartType}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderChart()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}