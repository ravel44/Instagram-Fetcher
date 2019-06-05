var runInstaData=0; // switch
//------------------------------------------------------------------------------------------
function getInstaDatasRun(username, postsBack, sheetDestination) {
          var r = new RegExp('<script type="text\/javascript">' + '([^{]+?({.*profile_pic_url.*})[^}]+?)' +'<\/script>');
          var url = "https://www.instagram.com/" + username, totalComments = 0, totalLikes = 0;
          var options = {
            "muteHttpExceptions":true
          };
          var source = UrlFetchApp.fetch(url, options).getContentText();  
          
     if (source && source.match(r)){
          var valid = source.match(r)[2];   
          var jsonStr = valid; 
          var data = JSON.parse(jsonStr);
//  Logger.log(JSON.stringify(data, null, 2));
          var oldVariantOfData = data['entry_data']['ProfilePage'][0];
          
          for(var i = 0; i < postsBack; i++) {
                   var eottm = oldVariantOfData.graphql.user.edge_owner_to_timeline_media.edges[i];
//    Logger.log(oldVariantOfData.graphql.user.edge_owner_to_timeline_media.edges);
                   if(eottm != undefined){
                        totalComments += parseInt(eottm.node.edge_media_to_comment.count);
                        totalLikes += parseInt(eottm.node.edge_liked_by.count);           
                   }
          }
    
                followerCount = oldVariantOfData.graphql.user.edge_followed_by.count;
                followCount = oldVariantOfData.graphql.user.edge_follow.count;
                mediaCount = oldVariantOfData.graphql.user.edge_owner_to_timeline_media.count;
                totalComments = totalComments;
                totalLikes = totalLikes;
                EngagementRatio = (((totalLikes+totalComments))/oldVariantOfData.graphql.user.edge_followed_by.count)/postsBack*100; 
          
          var ss = SpreadsheetApp.getActiveSpreadsheet();
          var sheet = ss.getSheetByName(sheetDestination);
          var nextRow = getLastRow("A", sheetDestination);
          var cell = sheet.getRange('a1');
          cell.offset(nextRow, 0).setValue(Utilities.formatDate(new Date(), "GMT-07:00", "MM-dd-yyyy"));
          cell.offset(nextRow, 1).setValue(followerCount);
          cell.offset(nextRow, 2).setValue(followCount);
          cell.offset(nextRow, 3).setValue(mediaCount);
          cell.offset(nextRow, 4).setValue(totalLikes);
          cell.offset(nextRow, 5).setValue(totalComments);
          cell.offset(nextRow, 6).setValue(EngagementRatio);  
          runInstaData=0;
          Logger.log("Insta Data Updated");
      }else{
          runInstaData = 1;
          return;    
      }
}

//-----------------------------------------------------------------------------------------
function getLastRow(column, sheetDestination) {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheetByName(sheetDestination);
        var range = sheet.getRange(column + "1:" + column);
        var values = range.getValues();
        var newarr = [];
        var count = 0;
        
        for (var i = 0; i < range.getLastRow(); i++) {
              if (values[i][0]) {
                      newarr.push(values[i][0]);
              }
        }
        return newarr.length;
}
//-------------------------------------------------------------------------------------------

function getInstaDatas(username, postsBack, sheetDestination){
     getInstaDatasRun(username, postsBack,sheetDestination);
    if ( runInstaData ===1){
      Utilities.sleep(15*1000);
      getInstaDatasRun(username, postsBack, sheetDestination);
    }   
}
