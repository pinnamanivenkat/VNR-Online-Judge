#include<bits/stdc++.h>
using namespace std;
#define ll long long
map<pair<ll,ll>,bool> visited;
ll sector = 0;
ll n,m;
ll sum;
vector<ll> sum_arr;
vector<vector<ll> > arr;
ll temp;
void adjacentFinder(ll i,ll j) {
    visited[{i,j}] = true;
    sum+=arr[i][j];
    temp = i-1;
    if(temp>=0 && arr[temp][j]!=0 && !visited[{temp,j}]) {
        adjacentFinder(temp,j);
    }
    temp = i+1;
    if(temp<n && arr[temp][j]!=0 && !visited[{temp,j}]) {
        adjacentFinder(temp,j);
    }
    temp = j-1;
    if(temp>=0 && arr[i][temp]!=0 && !visited[{i,temp}]) {
        adjacentFinder(i,temp);
    }
    temp = j+1;
    if(temp<m && arr[i][temp]!=0 && !visited[{i,temp}]) {
        adjacentFinder(i,temp);
    }
    return;
}
int main() {
    cin>>n>>m;
    for(ll i=0;i<n;i++) {
        vector<ll> temp_arr;
        for(ll j=0;j<m;j++) {
            cin>>temp;
            temp_arr.push_back(temp);
        }
        arr.push_back(temp_arr);
    }
    for(ll i=0;i<n;i++) {
        for(ll j=0;j<m;j++) {
            if(arr[i][j]!=0&&!visited[{i,j}]) {
                sector++;
                sum = 0;
                adjacentFinder(i,j);
                sum_arr.push_back(sum);
            }
        }
    }
    cout<<sector<<endl;
    sort(sum_arr.begin(),sum_arr.end());
    for(auto i:sum_arr) {
        cout<<i<<" ";
    }
    return 0;
}