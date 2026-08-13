import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../services/case.service';
import { CaseType, CaseStatus } from '../../models/case.model';
import * as echarts from 'echarts';
import { 
  LucideCalendar, 
  LucideFilter, 
  LucideDownload, 
  LucideFileText, 
  LucideBarChart3, 
  LucidePieChart 
} from '@lucide/angular';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LucideCalendar, 
    LucideFilter, 
    LucideDownload, 
    LucideFileText, 
    LucideBarChart3, 
    LucidePieChart
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit, OnDestroy {
  startDate = '';
  endDate = '';
  caseType: CaseType | 'ALL' = 'ALL';
  status: CaseStatus | 'ALL' = 'ALL';

  summaryData: any = null;
  Math = Math;

  private myDonutChart?: echarts.ECharts;
  private myBarChart?: echarts.ECharts;

  @ViewChild('chartContainer') set chartContainer(content: ElementRef) {
    if (content) {
      this.initDonutChart(content);
    }
  }

  @ViewChild('barChartContainer') set barChartContainer(content: ElementRef) {
    if (content) {
      this.initBarChart(content);
    }
  }

  constructor(private caseService: CaseService) {}

  ngOnInit() {
    // Default: start/end of current year
    const yr = new Date().getFullYear();
    this.startDate = `${yr}-01-01`;
    this.endDate = `${yr}-12-31`;
    this.generateReport();
  }

  generateReport() {
    this.caseService.getReportsSummary({
      startDate: this.startDate || undefined,
      endDate: this.endDate || undefined,
      caseType: this.caseType === 'ALL' ? undefined : (this.caseType as CaseType),
      status: this.status === 'ALL' ? undefined : (this.status as CaseStatus)
    }).subscribe((data: any) => {
      this.summaryData = data;
      this.updateDonutChartOptions();
      this.updateBarChartOptions();
    });
  }

  initDonutChart(container: ElementRef) {
    if (this.myDonutChart) {
      this.myDonutChart.dispose();
    }
    this.myDonutChart = echarts.init(container.nativeElement);
    this.updateDonutChartOptions();
    window.addEventListener('resize', this.resizeCharts);
  }

  initBarChart(container: ElementRef) {
    if (this.myBarChart) {
      this.myBarChart.dispose();
    }
    this.myBarChart = echarts.init(container.nativeElement);
    this.updateBarChartOptions();
    window.addEventListener('resize', this.resizeCharts);
  }

  updateDonutChartOptions() {
    if (!this.myDonutChart || !this.summaryData) return;

    const legalCount = this.summaryData.caseTypesChart[0]?.value || 0;
    const labourCount = this.summaryData.caseTypesChart[1]?.value || 0;
    const totalCount = this.summaryData.totalCases;

    const option: any = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: <strong>{c} cases</strong> ({d}%)',
        backgroundColor: '#ffffff',
        borderColor: '#cbd5e1',
        borderWidth: 1,
        textStyle: {
          color: '#334155',
          fontSize: 12
        }
      },
      series: [
        {
          name: 'Case Types',
          type: 'pie',
          radius: ['55%', '80%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#ffffff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: false
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: legalCount, name: 'Legal Cases', itemStyle: { color: '#3b82f6' } },
            { value: labourCount, name: 'Labour Cases', itemStyle: { color: '#fbbf24' } }
          ]
        }
      ],
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '38%',
          style: {
            text: totalCount.toString(),
            textAlign: 'center',
            fill: '#0f172a',
            fontSize: 26,
            fontWeight: 'bold'
          }
        },
        {
          type: 'text',
          left: 'center',
          top: '56%',
          style: {
            text: totalCount === 1 ? 'MATTER' : 'MATTERS',
            textAlign: 'center',
            fill: '#64748b',
            fontSize: 9,
            fontWeight: 'bold',
            letterSpacing: 1.5
          }
        }
      ]
    };

    this.myDonutChart.setOption(option);
  }

  updateBarChartOptions() {
    if (!this.myBarChart || !this.summaryData) return;

    const monthsData = this.summaryData.monthlyCasesChart || [];
    const categories = monthsData.map((b: any) => this.formatMonthLabel(b.month));
    const counts = monthsData.map((b: any) => b.count);

    const option: any = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: '#ffffff',
        borderColor: '#cbd5e1',
        borderWidth: 1,
        textStyle: {
          color: '#334155',
          fontSize: 12
        }
      },
      grid: {
        top: '12%',
        left: '4%',
        right: '4%',
        bottom: '8%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: {
          lineStyle: {
            color: '#cbd5e1'
          }
        },
        axisLabel: {
          color: '#475569',
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLine: {
          show: false
        },
        axisLabel: {
          color: '#475569',
          fontSize: 11
        },
        splitLine: {
          lineStyle: {
            color: '#f1f5f9',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: 'Cases Opened',
          type: 'bar',
          data: counts,
          barWidth: '40%',
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#60a5fa' }
            ])
          }
        }
      ]
    };

    this.myBarChart.setOption(option);
  }

  private resizeCharts = () => {
    this.myDonutChart?.resize();
    this.myBarChart?.resize();
  };

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeCharts);
    if (this.myDonutChart) {
      this.myDonutChart.dispose();
    }
    if (this.myBarChart) {
      this.myBarChart.dispose();
    }
  }

  formatCost(val: number): string {
    return val.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getPercentage(val: number): number {
    if (!this.summaryData || this.summaryData.totalCases === 0) return 0;
    return Math.round((val / this.summaryData.totalCases) * 100);
  }

  formatMonthLabel(m: string): string {
    const parts = m.split('-');
    if (parts.length < 2) return m;
    const monthNo = parseInt(parts[1], 10);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNo - 1] || m;
  }

  exportPDF() {
    alert('Simulating PDF Generation...\nFormatted Case Ledger Report downloaded to local downloads directory.');
  }

  exportExcel() {
    alert('Simulating Excel Export...\nCompleted compiling rows and financial cost analysis into spreadsheet format.');
  }
}
