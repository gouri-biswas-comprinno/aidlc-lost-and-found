import mongoose from 'mongoose';
import { validateReportFilters, validateReportInput } from '../validation/reportValidation.js';

function serializeReport(report) {
  if (!report) return report;
  const plainReport = typeof report.toObject === 'function' ? report.toObject() : { ...report };
  return { ...plainReport, id: String(plainReport._id), _id: undefined };
}

function requireValidId(id, response) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    response.status(400).json({ message: 'Report id is invalid.' });
    return false;
  }
  return true;
}

export function createReportController(Report) {
  return {
    list: async (request, response, next) => {
      try {
        const filterErrors = validateReportFilters(request.query);
        if (Object.keys(filterErrors).length > 0) {
          return response.status(400).json({ message: 'Filters are invalid.', errors: filterErrors });
        }

        const filter = {};
        if (request.query.type) filter.type = request.query.type;
        if (request.query.category) filter.category = request.query.category;
        if (request.query.status) filter.status = request.query.status;
        if (request.query.search) {
          const search = request.query.search.trim();
          filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } }
          ];
        }

        const reports = await Report.find(filter).sort({ createdAt: -1 }).lean();
        return response.json(reports.map(serializeReport));
      } catch (error) {
        return next(error);
      }
    },

    getOne: async (request, response, next) => {
      try {
        if (!requireValidId(request.params.id, response)) return;
        const report = await Report.findById(request.params.id).lean();
        if (!report) return response.status(404).json({ message: 'Report not found.' });
        return response.json(serializeReport(report));
      } catch (error) {
        return next(error);
      }
    },

    create: async (request, response, next) => {
      try {
        const { value, errors } = validateReportInput(request.body);
        if (Object.keys(errors).length > 0) {
          return response.status(400).json({ message: 'Report data is invalid.', errors });
        }
        const report = await Report.create(value);
        return response.status(201).json(serializeReport(report));
      } catch (error) {
        return next(error);
      }
    },

    update: async (request, response, next) => {
      try {
        if (!requireValidId(request.params.id, response)) return;
        const { value, errors } = validateReportInput(request.body);
        if (Object.keys(errors).length > 0) {
          return response.status(400).json({ message: 'Report data is invalid.', errors });
        }
        const report = await Report.findByIdAndUpdate(request.params.id, value, {
          new: true,
          runValidators: true
        }).lean();
        if (!report) return response.status(404).json({ message: 'Report not found.' });
        return response.json(serializeReport(report));
      } catch (error) {
        return next(error);
      }
    },

    resolve: async (request, response, next) => {
      try {
        if (!requireValidId(request.params.id, response)) return;
        const report = await Report.findByIdAndUpdate(
          request.params.id,
          { status: 'resolved' },
          { new: true, runValidators: true }
        ).lean();
        if (!report) return response.status(404).json({ message: 'Report not found.' });
        return response.json(serializeReport(report));
      } catch (error) {
        return next(error);
      }
    },

    remove: async (request, response, next) => {
      try {
        if (!requireValidId(request.params.id, response)) return;
        const report = await Report.findByIdAndDelete(request.params.id);
        if (!report) return response.status(404).json({ message: 'Report not found.' });
        return response.status(204).send();
      } catch (error) {
        return next(error);
      }
    }
  };
}
