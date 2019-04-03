#include<bits/stdc++.h>
using namespace std;
#define lld long long
#define pb push_back
#define mp make_pair
#define ff first
#define ss second
#define in insert
#define p printf
#define s scanf
#define f(i,a,b) for(i=a;i<=b;i++)
#define pii pair<int,int>
#define pll pair<long long,long long>
void bfs(lld a[50][50],int vi[50][50],int i,int j,int n,int m,vector<vector<pii>>&ans)
{
    vector<pii>temp;
    queue<pii>q;
    q.push(mp(i,j));
    vi[i][j]=1;
    while(q.size()!=0)
    {
        pii x=q.front();
        temp.pb(x);
        q.pop();
        int aa=x.ff,bb=x.ss;
        int c,d;
        //cout<<aa<<" "<<bb<<endl;
        c=aa-1,d=bb-1;
        if(vi[c][d]==0&&c>=0&&c<n&&d>=0&&d<m&&a[c][d]!=0&&a[c+1][d]!=0&&a[c][d+1]!=0)
        {
            q.push(mp(c,d));
            vi[c][d]=1;
        }
        c=aa,d=bb-1;
        if(vi[c][d]==0&&c>=0&&c<n&&d>=0&&d<m&&a[c][d]!=0)
        {
            q.push(mp(c,d));
            vi[c][d]=1;
        }
        c=aa+1,d=bb-1;
        if(vi[c][d]==0&&c>=0&&c<n&&d>=0&&d<m&&a[c][d]!=0&&a[c][d+1]!=0&&a[c-1][d]!=0)
        {
            q.push(mp(c,d));
            vi[c][d]=1;
        }
        c=aa-1,d=bb;
        if(vi[c][d]==0&&c>=0&&c<n&&d>=0&&d<m&&a[c][d]!=0)
        {
            q.push(mp(c,d));
            vi[c][d]=1;
        }
        c=aa+1,d=bb;
        if(vi[c][d]==0&&c>=0&&c<n&&d>=0&&d<m&&a[c][d]!=0)
        {
            q.push(mp(c,d));
            vi[c][d]=1;
        }
        c=aa-1,d=bb+1;
        if(vi[c][d]==0&&c>=0&&c<n&&d>=0&&d<m&&a[c][d]!=0&&a[c][d-1]!=0&&a[c+1][d]!=0)
        {
            q.push(mp(c,d));
            vi[c][d]=1;
        }
        c=aa,d=bb+1;
        if(vi[c][d]==0&&c>=0&&c<n&&d>=0&&d<m&&a[c][d]!=0)
        {
            q.push(mp(c,d));
            vi[c][d]=1;
        }
        c=aa+1,d=bb+1;
        if(vi[c][d]==0&&c>=0&&c<n&&d>=0&&d<m&&a[c][d]!=0&&a[c-1][d]!=0&&a[c][d-1]!=0)
        {
            q.push(mp(c,d));
            vi[c][d]=1;
        }
        pii p=q.front();
       // cout<<p.ff<<" "<<p.ss<<endl;
    }
    ans.pb(temp);
    //cout<<endl;
}
int main()
{
 ios_base::sync_with_stdio(0);
    cin.tie(0);
    cout.tie(0);
    int n,m;
    cin>>n>>m;
    lld a[50][50];
    int vi[50][50]={0};
    int i,j;
    for(i=0;i<n;i++)
    {
        for(j=0;j<m;j++)
            cin>>a[i][j];
    }
    vector<vector<pii>>ans;
    for(int i=0;i<n;i++)
    {
        for(int j=0;j<m;j++)
        {
            if(vi[i][j]==0&&a[i][j]!=0)
            {
                bfs(a,vi,i,j,n,m,ans);
            }
        }
    }
    cout<<ans.size()<<endl;
    lld sum;
    vector<int>print;
    for(int i=0;i<ans.size();i++)
    {
        sum=0;
        for(int j=0;j<ans[i].size();j++)
        {
            int aa=ans[i][j].ff;
            int bb=ans[i][j].ss;
            sum=sum+a[aa][bb];
        }
       print.pb(sum);
    }
    sort(print.begin(),print.end());
    for(i=0;i<print.size();i++)
        cout<<print[i]<<" ";
  return 0;
}