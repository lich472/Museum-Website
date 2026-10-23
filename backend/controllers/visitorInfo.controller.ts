
import { Request, Response } from 'express'
import VisitorInfo from '../models/visitorInfo.model'

// Get the museum's visitor information
export async function getVisitorInfo(
  req: Request,
  res: Response
) {
  try {
    let visitorInfo = await VisitorInfo.findOne({
      key: 'museum',
    })

    if (!visitorInfo) {
      visitorInfo = await VisitorInfo.create({
        key: 'museum',
      })
    }

    res.status(200).json(visitorInfo)
  } catch (error) {
    console.error('Error getting visitor information:', error)

    res.status(500).json({
      message: 'Failed to get visitor information',
    })
  }
}

// Update the museum's visitor information
export async function updateVisitorInfo(
  req: Request,
  res: Response
) {
  try {
    const {
      openingHours,
      closedDates,
      address,
      latitude,
      longitude,
      wheelchairAccess,
      parking,
      sensoryFriendlyHours,
      facilities,
    } = req.body

    const visitorInfo = await VisitorInfo.findOneAndUpdate(
      { key: 'museum' },
      {
        $set: {
          openingHours,
          closedDates,
          address,
          latitude,
          longitude,
          wheelchairAccess,
          parking,
          sensoryFriendlyHours,
          facilities,
        },
        $setOnInsert: {
          key: 'museum',
        },
      },
      {
        returnDocument: 'after',
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    )

    res.status(200).json({
      message: 'Visitor information updated successfully',
      visitorInfo,
    })
  } catch (error) {
    console.error('Error updating visitor information:', error)

    res.status(500).json({
      message: 'Failed to update visitor information',
    })
  }
}
