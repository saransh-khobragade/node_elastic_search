'use strict'

require('array.prototype.flatmap').shim()
const { Client } = require('@elastic/elasticsearch')
const client = new Client({
  node: 'http://localhost:9200'
})

const dataset = require('./dataset')

async function ping(req,res) {
  const { body } = await client.ping()
  res.send(body)
}
async function refresh_data(req,res) {
  
  //deleting all the index if present
  await delete_index('tweets')
  
  //creating index with mapping according to which data will be inserted
  await client.indices.create({
    index: 'tweets',
    body: {
      mappings: {
        properties: {
          id: { type: 'integer' },
          text: { type: 'text'},
          user: { type: 'keyword' },
          time: { type: 'date' }
        }
      },
      settings: {
        "analysis": {
          "analyzer": {
            "edge_ngram_analyzer": {
              "filter": [
                "lowercase",
                "trim"
              ],
              "tokenizer": "ngram_tokenizer"
            },
            "ngram_analyzer": {
              "tokenizer": "ngram_tokenizer"
            }
          },
          "tokenizer": {
            "edge_ngram_tokenizer": {
              "type": "edge_ngram",
              "min_gram": 3,
              "max_gram": 7
            },
            "ngram_tokenizer": {
              "type": "ngram",
              "min_gram": 3,
              "max_gram": 4
            }
          }
        },
      }
    }
  }, { ignore: [400] })

  

  const body = dataset.flatMap(doc => [{ index: { _index: 'tweets' } }, doc])

  const { body: bulkResponse } = await client.bulk({ refresh: true, body })

  if (bulkResponse.errors) {
    const erroredDocuments = []
    // The items array has the same order of the dataset we just indexed.
    // The presence of the `error` key indicates that the operation
    // that we did for the document has failed.
    bulkResponse.items.forEach((action, i) => {
      const operation = Object.keys(action)[0]
      if (action[operation].error) {
        erroredDocuments.push({
          // If the status is 429 it means that you can retry the document,
          // otherwise it's very likely a mapping error, and you should
          // fix the document before to try it again.
          status: action[operation].status,
          error: action[operation].error,
          operation: body[i * 2],
          document: body[i * 2 + 1]
        })
      }
    })
    console.log(erroredDocuments)
  }

  const { body: count } = await client.count({ index: 'tweets' })
  res.send(count)
}
async function search(req,res) {
  
  //we are searching only for text property
  const { body } = await client.search({
    index: 'tweets',
    body: req.body
  })

  res.send(body.hits.hits)
}
async function delete_index(index) {
  const { body } = await client.indices.delete({
    index: index,
  })
  console.log(body)
}

module.exports = {ping,refresh_data,search,delete_index}