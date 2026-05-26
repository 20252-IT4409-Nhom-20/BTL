# HackerNews Payload Schema Reference

To match the behavior of standard HackerNews feeds, our application models items on a polymorphic schema. All entities—stories, comments, jobs, polls, and even poll choices—are represented as "Items".

## Core Item Properties

| Field | Type | Description |
|---|---|---|
| **`id`** | Number | Unique sequential integer ID mimicking the official HN system. |
| `deleted` | Boolean | True if the item is deleted. |
| `type` | String | One of `'story'`, `'comment'`, `'job'`, `'poll'`, `'pollopt'`. |
| `by` | String | Username of the creator. |
| `time` | Number | Unix timestamp representing creation date. |
| `text` | String | The main body/comment text formatted in safe HTML. |
| `dead` | Boolean | True if flagged as dead or heavily flagged. |
| `parent` | Number | Parent ID (either another comment or a root story). |
| `kids` | Array[Number] | Array containing children comment IDs, sorted in ranked display order. |
| `url` | String | Link URL for external stories. |
| `score` | Number | Overall upvote counts. |
| `title` | String | Title of the story or job. |
| `descendants` | Number | Total nested comment count for a parent story. |

---

## Sample Payload Scenarios

### 1. A Story Item
```json
{
  "by": "dhouston",
  "descendants": 71,
  "id": 8863,
  "kids": [ 8952, 9224, 8917 ],
  "score": 111,
  "time": 1175714200,
  "title": "My YC app: Dropbox - Throw away your USB drive",
  "type": "story",
  "url": "http://www.getdropbox.com/u/2/screencast.html"
}
```

### 2. A Comment Item (Child)
```json
{
  "by": "norvig",
  "id": 2921983,
  "kids": [ 2922097 ],
  "parent": 8863,
  "text": "Aw shucks, guys ... you make me blush with your compliments.",
  "time": 1314211127,
  "type": "comment"
}
```
