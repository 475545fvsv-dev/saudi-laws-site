exports.handler = async function(event) {
  var h = {'Access-Control-Allow-Origin':'*','Content-Type':'application/json'};
  if (event.httpMethod !== 'POST') return {statusCode:405,headers:h,body:''};
  try {
    var q = JSON.parse(event.body).question;
    if (!q) return {statusCode:400,headers:h,body:JSON.stringify({error:'empty'})};
    var r = await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':process.env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:1024,system:'Answer in Arabic about Saudi laws.',messages:[{role:'user',content:q}]})});
    var d = await r.json();
    return {statusCode:200,headers:h,body:JSON.stringify({answer:d.content?.[0]?.text||'',error:d.error?.message||''})};
  } catch(e) {
    return {statusCode:500,headers:h,body:JSON.stringify({error:e.message})};
  }
};
