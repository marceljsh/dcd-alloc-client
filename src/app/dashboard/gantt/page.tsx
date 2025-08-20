'use client'

import Component from '@/components/OriGantt'

export default function TimelinePage() {
  return (
    <div id="page-timeline" className="p-4 w-full">
      <Component id="gantt-chart" className="w-full overflow-x-auto" />
    </div>
  )
}
