// includes
const mongoose = require("mongoose");
const moment = require("moment");
const ObjectId = mongoose.Types.ObjectId;
const sanitize = require("mongo-sanitize");
const translate = require("../../helpers/translate");

// Models
const CustomerModel = require("../../models/Customers");
const TradeModel = require("../../models/Trades");
const SubTradeModel = require("../../models/SubTrades");
const ProjectModel = require("../../models/Projects");
// helper functions
const systemLogsHelper = require("../../helpers/system-logs");
const {
  sendResponse,
  checkKeysExist,
  setUserResponse,
} = require("../../helpers/utils");

// module name
const moduleName = "Project";
var lang = "english";
var channel = "web";

// const sendEmail = require("../../helpers/send-email-test");
module.exports = {
  create,
  update,
  getById,
  getAll
};

// Create function to handle project creates including subtrades
/**
 * 
 * @param {
    "isSubTradeAdded": false,
    "subtrades": [
        {
            "tradeId": "6894ae1eb07a99d1d5f561fb",
            "title": [
                "car1",
                "car2",
                "car3"
            ]
        },
        {
            "tradeId": "68960b21bd37d527096dada2",
            "title": [
                "elec1",
                "elec2",
                "elec3",
                "elec4",
                "elec5"
            ]
        }
    ],
    "title": "New Test Project Created 2",
    "postCode": "test post Code 2",
    "description": "Test Decription 2 ",
    "attachments": [
        {
            "fileUrl": "https://example.com/file1.pdf"
        },
        {
            "fileUrl": "https://example.com/file2.jpg"
        }
    ],
    "trades": [
        {
            "tradeId": "6894ae1eb07a99d1d5f561fb",
            "startDate": "2025-08-15T00:00:00.000Z",
            "endDate": "2025-08-20T00:00:00.000Z",
            "estimateBudget": 1000,
            "description": "",
            "subTradeIds": []
        },
        {
            "tradeId": "68960b21bd37d527096dada2",
            "startDate": "2025-08-21T00:00:00.000Z",
            "endDate": "2025-08-25T00:00:00.000Z",
            // "estimateBudget": 2000,
            "description": "Second trade example",
            "subTradeIds": []
        }
    ]
} request 
 * @param {*} response 
 * @returns 
 */
async function create(request, response) {
  try {
    channel = request.header("channel") ? request.header("channel") : lang;
    const userId = request?.user?._id;
    let payload = request.body;

    // Agar isSubTradeAdded true hai to subtrades insert karne ka kaam kare
    if (payload.isSubTradeAdded && Array.isArray(payload.subtrades)) {
      for (const subTradeGroup of payload.subtrades) {
        const { tradeId, title } = subTradeGroup;

        // Ensure title is array
        const titlesArray = Array.isArray(title) ? title : [title];

        for (const t of titlesArray) {
          // Create SubTrade entry
          const newSubTrade = await SubTradeModel.create({
            tradeId,
            title: t,
            type: "automated", // default type
            createdBy: userId || null,
          });

          // tradeId match karo aur subTradeIds push karo
          const tradeItem = payload.trades.find((tr) => tr.tradeId === tradeId);
          if (tradeItem) {
            tradeItem.subTradeIds.push(newSubTrade._id);
          }
        }
      }
    }

    // subtrades aur isSubTradeAdded remove kardo
    delete payload.subtrades;
    delete payload.isSubTradeAdded;

    // Final payload ProjectModel me insert karo
    console.log("Final Payload to be inserted in Project Model:", payload);
    const project = await ProjectModel.create(payload);
    console.log("Project Data Created", project);

    return sendResponse(
      response,
      "Create Project",
      200,
      1,
      "Project created successfully",
      payload
    );
  } catch (error) {
    console.error("--- create Project error ---", error);
    return sendResponse(
      response,
      "create Project",
      500,
      0,
      "Something went wrong"
    );
  }
}

// Update function to handle project updates including subtrades
// This function will handle the logic for updating projects, including adding and removing subtrades.
/**
 * 
 * @param {
  "_id": "66b8f123d6fdc30017403aaa",
  "title": "Renovation Project A",
  "postCode": "12345",
  "description": "Full home renovation with kitchen and bathroom upgrade.",
  "attachments": [
    { "fileUrl": "https://example.com/file1.pdf" },
    { "fileUrl": "https://example.com/file2.jpg" },
    { "fileUrl": "https://example.com/file3.png" }
  ],
  "trades": [
    {
      "tradeId": "6894ae1eb07a99d1d5f561fb",
      "startDate": "2025-08-10T00:00:00.000Z",
      "endDate": "2025-08-15T00:00:00.000Z",
      "estimateBudget": 1000,
      "description": "Kitchen upgrade",
      "subTradeIds": [
        "66b7f1a5d6fdc30017403cd2",
        "66b7f1b8d6fdc30017403cd3",
        "66b7f1c2d6fdc30017403cd4"
      ]
    },
    {
      "tradeId": "68960b21bd37d527096dada2",
      "startDate": "2025-08-20T00:00:00.000Z",
      "endDate": "2025-08-25T00:00:00.000Z",
      "estimateBudget": 1500,
      "description": "Bathroom remodeling",
      "subTradeIds": [
        "66b7f2d5d6fdc30017403cd5",
        "66b7f2e6d6fdc30017403cd6"
      ]
    }
  ],
  "isSubTradeAdded": true,
  "subtrades": [
    {
      "tradeId": "6894ae1eb07a99d1d5f561fb",
      "title": ["Tiles Replacement", "Cabinet Installation"]
    },
    {
      "tradeId": "68960b21bd37d527096dada2",
      "title": ["Plumbing", "Wall Painting"]
    }
  ],
  "deletedSubTrades": [
    "66b7f1a5d6fdc30017403cd2",
    "66b7f2d5d6fdc30017403cd5"
  ]
}
   request 
 * @param {*} response 
 * @returns 
 */
async function update(request, response) {
  try {
    const channel = request.header("channel") || lang;
    const userId = request?.user?._id;
    const payload = request.body;
    const projectId = payload._id;

    if (!projectId) {
      return sendResponse(
        response,
        "Update Project",
        422,
        0,
        "Project ID is required"
      );
    }

    // 1️⃣ Deleted subtrades ko remove karo
    if (
      Array.isArray(payload.deletedSubTrades) &&
      payload.deletedSubTrades.length > 0
    ) {
      await SubTradeModel.deleteMany({
        _id: { $in: payload.deletedSubTrades.map((id) => new ObjectId(id)) },
      });
    }
    delete payload.deletedSubTrades;

    // 2️⃣ Agar naye subtrades add ho rahe hain
    if (payload.isSubTradeAdded && Array.isArray(payload.subtrades)) {
      for (const subTradeGroup of payload.subtrades) {
        const { tradeId, title } = subTradeGroup;
        const titlesArray = Array.isArray(title) ? title : [title];

        for (const t of titlesArray) {
          const newSubTrade = await SubTradeModel.create({
            tradeId,
            title: t,
            type: "automated",
            createdBy: userId || null,
          });

          const tradeItem = payload.trades.find((tr) => tr.tradeId === tradeId);
          if (tradeItem) {
            tradeItem.subTradeIds.push(newSubTrade._id);
          }
        }
      }
    }
    delete payload.subtrades;
    delete payload.isSubTradeAdded;

    // 3️⃣ Project replace karo (purana sab remove, sirf payload save)
    await ProjectModel.replaceOne({ _id: new ObjectId(projectId) }, payload);

    return sendResponse(
      response,
      "Update Project",
      200,
      1,
      "Project updated successfully",
      payload
    );
  } catch (error) {
    console.error("--- update Project error ---", error);
    return sendResponse(
      response,
      "Update Project",
      500,
      0,
      "Something went wrong"
    );
  }
}

/**
 *                          Get Project by ID
 * @param {*} request
 * @param {*} response
 * @returns
 */
async function getById(request, response) {
  try {
    const { projectId } = request.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return sendResponse(
        response,
        "Project",
        422,
        0,
        "Invalid project ID format"
      );
    }

    let project = await ProjectModel.findById(projectId)
      .populate({
        path: "trades.tradeId", // ref: "Trade"
        select: "title type",
      })
      .populate({
        path: "trades.subTradeIds", // ref: "SubTrade"
        select: "title type",
      })
      .lean();

    if (!project) {
      return sendResponse(response, "Project", 422, 0, "Project not found");
    }

    // Transform trades
    project.trades = project.trades.map((trade) => {
      let formattedTrade = {
        ...trade,
        tradeId: trade.tradeId?._id || null,
        title: trade.tradeId?.title || null,
        type: trade.tradeId?.type || null,
      };

      // Transform subTradeIds
      formattedTrade.subTradeIds = (trade.subTradeIds || []).map((sub) => ({
        subTradeId: sub._id,
        title: sub.title,
        type: sub.type,
      }));

      return formattedTrade;
    });

    return sendResponse(
      response,
      "Project",
      200,
      1,
      "Project fetched successfully",
      project
    );
  } catch (error) {
    console.error("--- get Project By ID error ---", error);
    return sendResponse(response, "Project", 500, 0, "Something went wrong");
  }
}

// Get All Projects
/** Get all Projects **/
async function getAll(request, response) {
  let params = request.query;

  try {
    const model = ProjectModel;

    let page = params.startAt ? parseInt(params.startAt) : 1;
    let perPage = params.perPage ? parseInt(params.perPage) : 50;
    let sortBy = { createdAt: -1 };

    const $aggregate = [];

    // --- Filters ---
    if (params.status) {
      $aggregate.push({
        $match: {
          status: { $eq: params.status },
        },
      });
    }

    if (params.keyword) {
      const key = params.keyword;
      $aggregate.push({
        $match: {
          title: RegExp(key, "i"),
        },
      });
    }

    // --- Populate trades & subTrades ---
    $aggregate.push(
      {
        $lookup: {
          from: "trades",
          localField: "trades.tradeId",
          foreignField: "_id",
          as: "tradeDetails",
        },
      },
      {
        $lookup: {
          from: "subTrades",
          localField: "trades.subTradeIds",
          foreignField: "_id",
          as: "subTradeDetails",
        },
      }
    );

    // --- Sort, Pagination ---
    let data = await model
      .aggregate($aggregate)
      .sort(sortBy)
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();

    // --- Transform data like getById ---
    data = data.map((project) => {
      // Map trades array
      project.trades = project.trades.map((trade) => {
        const tradeDetail = project.tradeDetails.find(
          (t) => t._id.toString() === trade.tradeId.toString()
        );

        const subTrades = project.subTradeDetails.filter((st) =>
          trade.subTradeIds.some((id) => id.toString() === st._id.toString())
        );

        return {
          ...trade,
          tradeId: tradeDetail ? tradeDetail._id : null,
          title: tradeDetail ? tradeDetail.title : null,
          type: tradeDetail ? tradeDetail.type : null,
          subTradeIds: subTrades.map((st) => ({
            subTradeId: st._id,
            title: st.title,
            type: st.type,
          })),
        };
      });

      delete project.tradeDetails;
      delete project.subTradeDetails;

      return project;
    });

    // --- Total count ---
    const countAgg = [...$aggregate];
    countAgg.push({ $count: "total" });

    const count = await model.aggregate(countAgg).exec();
    const total = count.length ? count[0].total : 0;

    const respData = {
      projects: data,
      pagination: {
        total: total,
        perPage: perPage,
        current: page,
        first: 1,
        last: total ? Math.ceil(total / perPage) : 1,
        next: page < Math.ceil(total / perPage) ? page + 1 : "",
      },
    };

    return sendResponse(
      response,
      "Project",
      200,
      1,
      "Projects fetched successfully",
      respData
    );
  } catch (error) {
    console.log("--- getAll Projects API error ---", error);
    return sendResponse(response, "Project", 500, 0, "Something went wrong");
  }
}
