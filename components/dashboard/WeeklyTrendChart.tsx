import { Nord } from '@/constants/Colors';
import { analyzeBP } from '@/utils/BloodPressure';
import { addDays, endOfWeek, format, isSameDay, startOfWeek, subWeeks } from 'date-fns';
import { useMemo, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { IconButton, Text, useTheme } from 'react-native-paper';

// Helper to get rgba string from hex
const hexToRgba = (hex: string, opacity: number) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return `rgba(0,0,0,${opacity})`;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

interface WeeklyTrendChartProps {
    readings: {
        timestamp: number;
        systolic: number;
        diastolic: number;
    }[];
}

export function WeeklyTrendChart({ readings }: WeeklyTrendChartProps) {
    const theme = useTheme();
    const [weekOffset, setWeekOffset] = useState(0);
    const screenWidth = Dimensions.get("window").width;

    const { barData, weekLabel, hasData, maxValue, stepValue, yAxisOffset } = useMemo(() => {
        const now = new Date();
        const currentWeekStart = startOfWeek(subWeeks(now, weekOffset), { weekStartsOn: 0 }); 
        const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 });
        
        const rawData = new Array(7).fill(null).map((_, i) => {
            const day = addDays(currentWeekStart, i);
            const daysReadings = readings.filter(r => isSameDay(new Date(r.timestamp), day));
            
            if (daysReadings.length > 0) {
                const avgSys = daysReadings.reduce((acc, curr) => acc + curr.systolic, 0) / daysReadings.length;
                const avgDia = daysReadings.reduce((acc, curr) => acc + curr.diastolic, 0) / daysReadings.length;
                return { sys: avgSys, dia: avgDia, hasReading: true, label: format(day, 'd'), dateLabel: format(day, 'MMM d') };
            }
            return { sys: null, dia: null, hasReading: false, label: format(day, 'd'), dateLabel: format(day, 'MMM d') };
        });
    
        const hasAnyData = rawData.some(d => d.hasReading);
        const weekLabelText = `${format(currentWeekStart, 'MMM d')} - ${format(currentWeekEnd, 'MMM d')}`;
    
        if (!hasAnyData) {
            return { weekLabel: weekLabelText, hasData: false, barData: [], maxValue: 200, stepValue: 50, yAxisOffset: 0 };
        }

        // Calculate dynamic Y-axis settings
        const validItems = rawData.filter(d => d.hasReading && d.sys !== null && d.dia !== null);
        const maxSys = Math.max(...validItems.map(d => d.sys as number));
        const minDia = Math.min(...validItems.map(d => d.dia as number));

        // Determine Min Y (Axis Offset)
        // Keep it simple: Round down minDia to nearest 20, then subtract 20 for breathing room.
        // Ensure we don't go below 0.
        let yAxisOffset = Math.floor((minDia - 20) / 20) * 20;
        if (yAxisOffset < 0) yAxisOffset = 0;
        
        // Calculate Scale
        // We want 4 sections.
        // Target Range = maxSys - yAxisOffset.
        const targetRange = (maxSys + 10) - yAxisOffset; 
        
        // Find a step value. Round to nearest 5.
        const rawStep = targetRange / 4;
        const stepValue = Math.ceil(rawStep / 5) * 5;
        
        // MaxValue for GiftedCharts must equal stepValue * noOfSections
        // This effectively represents the RANGE of the chart, not the absolute top value (since we have an offset)
        const calculatedMaxRange = stepValue * 4;

        const barData = rawData.map((d) => {
            if (!d.hasReading || d.sys === null || d.dia === null) {
                return {
                    label: d.label,
                    labelTextStyle: { color: theme.colors.outline, fontSize: 12 },
                    stacks: [{ value: 0, color: 'transparent' }],
                };
            }

            const range = d.sys - d.dia;
            
            // For Gifted Charts with stackedBar and yAxisOffset, 
            // we pass ABSOLUTE values. The library subtracts the offset.
            const bottomSpacing = d.dia;
            const analysis = analyzeBP(d.sys, d.dia);

            return {
                label: d.label,
                labelTextStyle: { color: theme.colors.outline, fontSize: 12 },
                stacks: [
                    { value: bottomSpacing, color: 'transparent' },
                    { 
                        value: range, 
                        color: analysis.color, 
                        borderTopLeftRadius: 6,
                        borderTopRightRadius: 6,
                        borderBottomLeftRadius: 6,
                        borderBottomRightRadius: 6,
                        marginBottom: -1
                    }
                ],
                sys: d.sys,
                dia: d.dia,
                dateLabel: d.dateLabel
            };
        });

        return {
            weekLabel: weekLabelText,
            hasData: true,
            barData,
            maxValue: calculatedMaxRange,
            stepValue,
            yAxisOffset
        };

    }, [readings, weekOffset, theme]);

    return (
        <View style={[styles.sectionContainer, { backgroundColor: theme.colors.surface, padding: 0, paddingVertical: 16 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 }}>
                <Text variant="labelLarge" style={{ color: theme.colors.secondary, fontWeight: '600' }}>Weekly Trend</Text>
            </View>

            {hasData ? (
                <View style={{ paddingHorizontal: 10 }}>
                    <BarChart
                        stackData={barData}
                        height={188}
                        barWidth={18}
                        spacing={(screenWidth - 80 - (18 * 7)) / 7} 
                        initialSpacing={15}
                        hideRules
                        yAxisThickness={0}
                        xAxisThickness={0}
                        yAxisTextStyle={{ color: theme.colors.outline, fontSize: 10 }}
                        noOfSections={4}
                        maxValue={maxValue}
                        stepValue={stepValue}
                        yAxisOffset={yAxisOffset}
                        isAnimated={false}
                        pointerConfig={{
                            pointerStripUptoDataPoint: true,
                            pointerStripColor: theme.colors.outline,
                            pointerStripWidth: 2,
                            strokeDashArray: [2, 5],
                            pointerColor: theme.colors.primary,
                            radius: 6,
                            pointerLabelWidth: 100,
                            pointerLabelHeight: 90,
                            autoAdjustPointerLabelPosition: true,
                            pointerComponent: (item: any) => {
                                if (!item || !item.sys) return null;
                                
                                return (
                                    <View style={{ height: 90, width: 100, justifyContent: 'center', marginTop: -30, marginLeft: -40 }}>
                                        <View style={{ 
                                            padding: 10, 
                                            backgroundColor: theme.colors.backdrop, 
                                            borderRadius: 8,
                                            borderWidth: 1,
                                            borderColor: theme.colors.outline
                                        }}>
                                            <Text style={{ color: theme.colors.primary, fontSize: 12, marginBottom: 4 }}>{item.dateLabel || item.label}</Text>
                                            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                                Sys: <Text style={{color: Nord.chartSystolic}}>{Math.round(item.sys)}</Text>
                                            </Text>
                                            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                                Dia: <Text style={{color: Nord.chartDiastolic}}>{Math.round(item.dia)}</Text>
                                            </Text>
                                        </View>
                                    </View>
                                );
                            }
                        }}
                    />
                </View>
            ) : (
                <View style={{ height: 220, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>No data for this week</Text>
                </View>
            )}
            
            {/* Pagination Controls */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 12 }}>
                <IconButton 
                    icon="chevron-left" 
                    size={24} 
                    iconColor={theme.colors.primary}
                    onPress={() => setWeekOffset(prev => prev + 1)} 
                />
                
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>
                    {weekLabel}
                </Text>

                <IconButton 
                    icon="chevron-right" 
                    size={24} 
                    iconColor={weekOffset > 0 ? theme.colors.primary : theme.colors.outline}
                    disabled={weekOffset <= 0}
                    onPress={() => setWeekOffset(prev => Math.max(0, prev - 1))} 
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },
});
