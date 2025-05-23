import { LogWithPopulate } from '@/types'
import React from 'react'
import dayjs from 'dayjs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface Props {
  logs: LogWithPopulate[],
  height?: string,
}

const LogsAccordionView: React.FC<Props> = ({ logs, height = '250' }) => {
  const reversedLogs = [...logs].reverse()

  return (
    <div className="space-y-4">
      <div className="overflow-auto border border-gray-300 rounded-md p-4"
        style={{ maxHeight: `${ height }px` }}>
        <Accordion type="multiple" className="w-full">
          {reversedLogs.map((log, index) => (
            <AccordionItem key={index} value={`log-${ index }`}>
              <AccordionTrigger>
                <div className="flex gap-4 items-center">
                  <span className="font-medium">{log.user?.displayName}</span>
                  <span className="text-xs text-muted-foreground">
                    {dayjs(log.date).format('YYYY-MM-DD HH:mm:ss')}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-4 space-y-1">
                  {log.change
                    .split(';')
                    .filter(Boolean)
                    .map((item, i) => (
                      <li key={i} className="break-words">{item.trim()}</li>
                    ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}

export default LogsAccordionView
