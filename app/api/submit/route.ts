// app/api/submit/route.ts
import { NextResponse } from 'next/server'
import { OnboardingSchema } from './schema'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate the data against our schema
    const validatedData = OnboardingSchema.parse(body)

    // Log successful submission (replace with database save later)
    console.log(`Processing onboarding data for ${validatedData.firstName} ${validatedData.lastName}`)

    // Here we would typically save to a database
    // const result = await db.onboarding.create({ data: validatedData })

    return NextResponse.json({
      success: true,
      message: 'Onboarding data received successfully',
      data: {
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        intake_date: validatedData.intakeDate
      }
    })

  } catch (error) {
    if (error instanceof ZodError) {
      // Handle validation errors
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      }, { status: 400 })
    }

    // Handle other errors
    console.error('Error processing request:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to process onboarding data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}