// includes
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const sanitize = require("mongo-sanitize");

// Models
const ProductModel = require("../../models/Products");
const ProductDetailsModel = require("../../models/ProductDetails");

// helper functions
const systemLogsHelper = require("../../helpers/system-logs");
const {
  sendResponse,
  updateLanguageContent,
  getModuleNameFromLanguage,
  getResponseMsgsFromLanguage,
} = require("../../helpers/utils");

// module name
// const moduleName = 'Products'
// var lang= "english"
let moduleName;
let responseMsgs;
var lang = "english";

module.exports = {
  getById,
  getAll,
};
/** Get product by Id **/
async function getById(request, response) {
  let params = request.params;
  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(lang, "ProductController");
  responseMsgs = await getResponseMsgsFromLanguage(lang, "ProductController");

  try {
    /** set model to fetch **/
    const model = await ProductModel;

    $aggregate = [
      {
        $lookup: {
          from: "systemUsers",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdByDetails",
        },
      },
      {
        $unwind: {
          path: "$createdByDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "productDetails",
          localField: "productId",
          foreignField: "_id",
          as: "details",
        },
      },
      {
        $unwind: {
          path: "$details",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    $aggregate.push({
      $match: {
        _id: new ObjectId(params.productId),
      },
    });

    let $project = {
      _id: "$_id",
      title: "$title." + lang,
      description: "$description." + lang,
      status: "$status",
      hasSubProducts: "$hasSubProducts",
      parentId: "$parentId",
      createdBy: "$createdByDetails.fullName",
      isRequestCallButton: "$isRequestCallButton",
      image: "$image",
      createdAt: "$createdAt",
    };

    let data = await model.aggregate([$aggregate]).project($project).exec();
    let responseData = null;
    let detailsObj = null;
    if (data && data.length && data.length > 0) {
      responseData = data[0];
      let getDetails = await ProductDetailsModel.findOne({
        productId: new ObjectId(responseData._id),
      });
      if (getDetails) {
        let details = await updateLanguageContent(getDetails, lang);
        if (request.header("channel") && request.header("channel") != "web") {
          let transData = await transformData(details);
          detailsObj = {
            _id: details._id,
            productId: details.productId,
            gallery: details.gallery,
            brochures: details.brochures,
            bannerImage: details.bannerImage,
            sections: transData,
          };
        }
        responseData.details = detailsObj ? detailsObj : details;
      }
    }
    //create system logs
    let systemLogsData = {
      userId: request.user._id,
      userIp: request.ip,
      roleId: request.user.roleId,
      module: moduleName,
      action: "getById",
      data: responseData,
    };
    let systemLogs = await systemLogsHelper.composeSystemLogs(systemLogsData);

    let respData = {
      product: responseData,
    };
    return sendResponse(
      response,
      moduleName,
      200,
      1,
      responseMsgs.productsFetched,
      // "Product fetched",
      respData
    );
  } catch (error) {
    console.log("--- getById API error ---", error);
    return sendResponse(
      response,
      moduleName,
      500,
      0,
      responseMsgs.error_500
      // "Something went wrong, please try again later."
    );
  }
}

/** Get all products **/
async function getAll(request, response) {
  let params = request.query;
  let parentId =
    request.params && request.params.parentId ? request.params.parentId : null;
  lang = request.header("lang") ? request.header("lang") : lang;
  moduleName = await getModuleNameFromLanguage(lang, "ProductController");
  responseMsgs = await getResponseMsgsFromLanguage(lang, "ProductController");

  try {
    /** set model to fetch all **/
    const model = await ProductModel;

    /** page number for pagination **/
    let page = params.startAt ? parseInt(params.startAt) : 1;

    /**  per page **/
    let perPage = params.perPage ? parseInt(params.perPage) : 10;

    /**  how to sort the list  **/
    let sortBy = { createdAt: 1 };

    $aggregate = [
      {
        $lookup: {
          from: "systemUsers",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdByDetails",
        },
      },
      {
        $unwind: {
          path: "$createdByDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Always match products with status "active"
      {
        $match: {
          status: "active",
        },
      },
    ];

    /** filter for main & sub products  **/
    if (parentId) {
      $aggregate.push({
        $match: {
          parentId: new ObjectId(parentId),
        },
      });
    } else {
      if (
        params.isHajjUmrahProduct &&
        (params.isHajjUmrahProduct == true ||
          params.isHajjUmrahProduct == "true")
      ) {
        $aggregate.push({
          $match: {
            isHajjUmrahProduct: true,
          },
        });
      } else {
        $aggregate.push({
          $match: {
            $or: [{ isSubProduct: false }, { parentId: null }],
          },
        });
      }
    }

    /** filter via status  **/
    if (params.status) {
      $aggregate.push({
        $match: {
          status: {
            $eq: params.status,
          },
        },
      });
    }

    /** filter via title  **/

    if (params.keyword) {
      let key = params.keyword;

      $aggregate.push({
        $match: {
          $or: [
            {
              "title.english": RegExp(key, "i"),
            },
          ],
        },
      });
    }

    let $project = {
      _id: "$_id",
      title: "$title." + lang,
      description: "$description." + lang,
      status: "$status",
      hasSubProducts: "$hasSubProducts",
      parentId: "$parentId",
      createdBy: "$createdByDetails.fullName",
      isRequestCallButton: "$isRequestCallButton",
      image: "$image",
      createdAt: "$createdAt",
    };
    let data = await model
      .aggregate([$aggregate])
      .project($project)
      .sort(sortBy)
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();

    $aggregate.push({
      $count: "total",
    });
    const count = await model.aggregate($aggregate).exec();

    const total = count.length ? count[0].total : 0;

    //create system logs
    let systemLogsData = {
      userId: request.user._id,
      userIp: request.ip,
      roleId: request.user.roleId,
      module: moduleName,
      action: "getAll",
      data: data,
    };
    let systemLogs = await systemLogsHelper.composeSystemLogs(systemLogsData);

    let respData = {
      bannerImage: "products/file-1714378941503.jpg",
      products: data,
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
      moduleName,
      200,
      1,
      responseMsgs.productsFetched,
      // "Products fetched",
      respData
    );
  } catch (error) {
    console.log("--- getAll API error ---", error);
    return sendResponse(
      response,
      moduleName,
      500,
      0,
      responseMsgs.error_500
      // "Something went wrong, please try again later."
    );
  }
}

async function transformData(input) {
  const output = [];

  // Loop through each section
  input.sections.forEach((section) => {
    // Loop through each body item in the section
    section.body.forEach((item) => {
      output.push({
        type: item.type,
        data: {
          content: item.content,
        },
      });
    });
  });

  return output;
}
